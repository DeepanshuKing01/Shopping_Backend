const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const Registermodel = require("../models/Registermodel")
// const transporter = require("../utils/Mailer")
const saltRounds = 10

const getUserByUsername = async (req, res) => {
    try {
        const { un } = req.query

        if (!un) {
            return res.send({ code: 0, msg: "Username required" })
        }
        const result = await Registermodel.findOne({ username: un }).select("-pass")

        if (!result) {
            return res.send({ code: 0, msg: "User not found" })
        }
        res.send({ code: 1, udata: result })

    } catch (e) {
        res.send({ code: 0, msg: e.message })
    }
}
const getAllMembers = async (req, res) => {
    try {
        const result = await Registermodel.find({})
        if (result.length == 0) {
            res.send({ code: 0 })
        }
        else {
            res.send({ code: 1, udata: result })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const deleteMember = async (req, res) => {
    try {
        // 🔒 Block admin from deleting their own account
        if (req.user.usertype === "admin" && req.user.id === req.query.mid) {
            return res.status(400).send({ msg: "Admin cannot delete own account" })
        }
        // 🔒 Authorization check (admin OR self)
        if (req.user.usertype !== "admin" && req.user.id !== req.query.mid) {
            return res.status(403).send({ success: false, msg: "Access denied" })
        }
        const result = await Registermodel.deleteOne({ _id: req.query.mid })
        if (result.deletedCount == 1) {
            res.send({ success: true })
        }
        else {
            res.send({ success: false })
        }
    }
    catch (e) {
        res.send({ success: false })
    }
}
const createAdmin = async (req, res) => {
    try {
        const code = uuidv4(); // activation code
        const hash = bcrypt.hashSync(req.body.pass, saltRounds)
        const newrecord = Registermodel({ name: req.body.pn, phone: req.body.phone, username: req.body.uname, pass: hash, usertype: "admin", isActivated: false, actcode: code })
        const result = await newrecord.save()  //saving document to real collection
        if (result) {
            try {
                const response = await fetch(process.env.MICROSERVICE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`
                    },
                    body: JSON.stringify({
                        to: req.body.uname,
                        subject: 'Activation mail from ShoppingWorld.com',
                        html: `Dear ${req.body.pn},<br/><br/>Thanks for signing up on our website. Click on the following link to activate your account<br/><br/><a href="${process.env.CLIENT_URL}/activateaccount?id=${code}">Activate Account</a>`
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    console.log("Microservice error:", data.error);
                    return res.send({ code: -1 });
                }

                console.log('Email sent via microservice');
                return res.send({ code: 1 });

            } catch (mailError) {
                console.log("Fetch error:", mailError);
                return res.send({ code: -1 });
            }
        }
        else {
            res.send({ code: 0 })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
module.exports = { getUserByUsername, getAllMembers, deleteMember, createAdmin }