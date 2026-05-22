const Registermodel = require("../models/Registermodel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// const transporter = require("../utils/Mailer")
const { v4: uuidv4 } = require("uuid")
const saltRounds = 10
const register = async (req, res) => {
    try {
        const findresult = await Registermodel.findOne({ username: req.body.uname })
        if (!findresult) {
            code = uuidv4()
            const hash = bcrypt.hashSync(req.body.pass, saltRounds)
            const newrecord = Registermodel({ name: req.body.pn, phone: req.body.phone, username: req.body.uname, pass: hash, usertype: "user", isActivated: false, actcode: code })
            const result = await newrecord.save()  //saving document to real collection
            if (result) {
                // Call the Microservice instead of local transporter
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
                // const mailOptions =
                // {
                //     from: `"Website Contact" <${process.env.SMTP_UNAME}>`,//transporter username email
                //     to: req.body.uname,
                //     subject: 'Activation mail from ShoppingWorld.com',
                //     html: `Dear ${req.body.pn},<br/><br/>Thanks for signing up on our website. Click on the following link to activate your account<br/><br/>${process.env.CLIENT_URL}/activateaccount?id=${code}`
                // };
                // // Use the transport object to send the email
                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         console.log(error);
                //         res.send({ code: -1 })
                //     }
                //     else {
                //         console.log('Email sent: ' + info.response)
                //         res.send({ code: 1 })
                //     }
                // })
            }
            else {
                res.send({ code: 0 })
            }
        }
        else {
            res.send({ code: -2, msg: "Username already exists" })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const activateaccount = async (req, res) => {
    try {
        const code = req.query.id
        if (!code) {
            return res.send({ code: 0, msg: "Invalid link" })
        }
        const result = await Registermodel.findOne({ actcode: code })
        if (!result) {
            return res.send({ code: 0, msg: "Invalid code" }) // invalid code
        }
        if (result.isActivated) {
            return res.send({ code: 0, msg: "Already activated" }) // already activated
        }
        // activate account
        result.isActivated = true
        // invalidate token (one-time use)
        result.actcode = null
        await result.save()
        return res.send({ code: 1 })
    } catch (e) {
        return res.send({ code: 0 })
    }
}
const resendactivation = async (req, res) => {
    try {
        const { id } = req.body  // this is actcode now

        if (!id) {
            return res.send({ code: 0, msg: "Invalid request" })
        }

        const user = await Registermodel.findOne({ actcode: id })
        if (!user) {
            return res.send({ code: 0, msg: "User not found" })
        }

        if (user.isActivated) {
            return res.send({ code: 0, msg: "Already activated" })
        }
        //  generate new token (old one automatically invalid)
        const newCode = uuidv4()
        user.actcode = newCode
        await user.save()
        try {
            const response = await fetch(process.env.MICROSERVICE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`
                },
                body: JSON.stringify({
                    to: user.username,
                    subject: 'New Activation Link',
                    html: `
                        Dear ${user.name},<br/><br/>
                        Your new activation link:<br/><br/>
                        <a href="${process.env.CLIENT_URL}/activateaccount?id=${newCode}">
                            Activate Account
                        </a><br/><br/>
                        Note: Old link is now invalid.
                    `
                })
            });

            const data = await response.json();
            if (!data.success) {
                return res.send({ code: 0, msg: "Email failed" });
            }
            
            return res.send({ code: 1 })
            
        } catch (mailError) {
            return res.send({ code: 0, msg: "Email failed" })
        }
        // const mailOptions = {
        //     from: `"Website Contact" <${process.env.SMTP_UNAME}>`,
        //     to: user.username,
        //     subject: 'New Activation Link',
        //     html: `
        //         Dear ${user.name},<br/><br/>
        //         Your new activation link:<br/><br/>
        //         <a href="${process.env.CLIENT_URL}/activateaccount?id=${newCode}">
        //             Activate Account
        //         </a><br/><br/>
        //         Note: Old link is now invalid.
        //     `
        // }
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         return res.send({ code: 0, msg: "Email failed" })
        //     }
        //     res.send({ code: 1 })
        // })
    } catch (e) {
        res.send({ code: 0, msg: "Server error" })
    }
}
const login = async (req, res) => {
    try {
        const { uname, pass, remember, captcha } = req.body

        if (!uname || !pass) {
            return res.send({ code: 0, msg: "Email and password are required" })
        }

        const emailRegex =
            /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (!emailRegex.test(uname)) {
            return res.send({ code: 0, msg: "Invalid email format" })
        }

        if (!captcha) {
            return res.send({ code: 0, msg: "Captcha is required" })
        }

        const verifyURL = "https://www.google.com/recaptcha/api/siteverify"

        const captchaRes = await fetch(verifyURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha
            })
        })

        const captchaData = await captchaRes.json()
        if (!captchaData.success) {
            return res.send({ code: 0, msg: "Captcha verification failed" })
        }
        const result = await Registermodel.findOne({ username: uname })

        if (!result) {
            return res.send({ code: 0, msg: "Incorrect Username/Password" })
        }
        else {
            if (bcrypt.compareSync(req.body.pass, result.pass)) {
                if (result.isActivated === true) {
                    const respdata = { _id: result.id, name: result.name, phone: result.phone, username: result.username, usertype: result.usertype }
                    let expiresIn = remember ? "7d" : "1h"
                    let jtoken = jwt.sign({ id: result._id, username: result.username, usertype: result.usertype, remember: remember }, process.env.JSECRETKEY, { expiresIn })
                    console.log(jtoken)

                    const cookie = {
                        httpOnly: true,
                        // secure: false,
                        // sameSite: "lax"
                        secure: process.env.NODE_ENV === "production",
                        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
                    }

                    // 👉 Apply remember me logic
                    if (remember) {
                        // user checked "Remember me" → persist login
                        cookie.maxAge = 7 * 24 * 60 * 60 * 1000  // 7 days
                    } 
                    // ❌ else → DO NOT set maxAge → becomes session cookie → deleted on browser close

                    res.cookie("authToken", jtoken, cookie)
                    res.send({ code: 1, udata: respdata, msg: "Login successful" })
                }
                else {
                    res.send({ code: 0, message: "Your account is not activated, Please activate and Login" })
                }
            }
            else {
                res.send({ code: 0, msg: "Incorrect Username/Password" })
            }
        }
    }
    catch (e) {
        console.log("Login Error:", e)
        return res.send({ code: 0, msg: "Server error" })
    }
}
const checkAuth = async (req, res) => {
    try {
        const user = await Registermodel.findById(req.user.id).select("-pass")

        if (!user) {
            return res.send({ code: 0 })
        }

        res.send({
            code: 1,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                phone: user.phone,
                usertype: user.usertype
            }
        })
    }
    catch (err) {
        console.log(err)
        res.send({ code: 0 })
    }
}
const logout = (req, res) => {
    // res.clearCookie("authToken", {
    res.cookie("authToken", "", {
        httpOnly: true,
        // secure: false,
        // sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        expires: new Date(0)
    })
    res.send({ code: 1 })
}
const changePassword = async (req, res) => {
    try {
        const result = await Registermodel.findOne({ username: req.body.uname })
        if (result == null) {
            res.send({ code: 0 })
        }
        else {
            if (bcrypt.compareSync(req.body.currpass, result.pass)) {
                const hash = bcrypt.hashSync(req.body.newpass, saltRounds)
                const result = await Registermodel.updateOne({ username: req.body.uname }, { pass: hash })
                if (result.modifiedCount === 1) {
                    res.clearCookie("authToken", {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                        path: "/"
                    })
                    return res.send({ code: 1, msg: "Password changed successfully" })
                }
                else {
                    return res.send({ code: 0, msg: "Password not updated" })
                }
            }
            else {
                return res.send({ code: -1, msg: "Current password incorrect" })
            }
        }
    }
    catch (e) {
        console.log(e)
        return res.send({ code: 0, msg: "Server error" })
    }
}
module.exports = { register, activateaccount, resendactivation, login, checkAuth, logout, changePassword }
