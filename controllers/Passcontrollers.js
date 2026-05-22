const crypto = require("crypto")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

const Registermodel = require("../models/Registermodel")
const resetPassModel = require("../models/Resetpasswordmodel")
const resetPassword = async (req, res) => {
    try {
        const { username, captcha } = req.body

        // ✅ 1. Basic validation
        if (!username) {
            return res.send({ code: 0, msg: "Email is required" })
        }

        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (!emailRegex.test(username)) {
            return res.send({ code: 0, msg: "Invalid email format" })
        }

        if (!captcha) {
            return res.send({ code: 0, msg: "Captcha is required" })
        }

        // ✅ 2. Verify CAPTCHA using FETCH API
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

        // ✅ 3. Check user exists
        const result = await Registermodel.findOne({ username })

        // security purpose
        if (!result) {
            return res.send({ code: 1, msg: "If account exists, reset link has been sent" })
        }
        else {
            const resettoken = uuidv4()
            const crypto = require("crypto")

            const hashedToken = crypto
                .createHash("sha256")
                .update(resettoken)
                .digest("hex")
            // const currentDateUTC = new Date() // Get the current date in UTC
            // const ISTOffset = (5.5 * 60 * 60 * 1000) + 900000; // IST offset in milliseconds (5 hours 30 minutes + 15 minutes)
            // const exptime = new Date(currentDateUTC.getTime() + ISTOffset); // Convert to IST
            const exptime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await resetPassModel.findOneAndUpdate({ username: username }, { username: username, token: hashedToken, exptime: exptime, },
                { upsert: true, new: true }
            )
        }
        // const saveresult = await newrecord.save()
        // if (saveresult) {
        try {
            const response = await fetch(process.env.MICROSERVICE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`
                },
                body: JSON.stringify({
                    to: username,
                    subject: 'Reset Password Mail from ShoppingWorld.com',
                    html: `Dear ${result.name},<br/><br/>Click on the following link to reset your password:<br/><br/><a href="${process.env.CLIENT_URL}/resetpassword?token=${resettoken}">Reset Password</a>`
                })
            });

            const data = await response.json();

            if (!data.success) {
                console.log("Microservice error:", data.error);
                return res.send({ code: 0, msg: "Failed to send reset email" });
            }

            console.log('Reset password email sent via microservice');
            return res.send({ code: 1, msg: "Check your mail to reset password. Link is valid for 15 mins only" });

        } catch (mailError) {
            console.log("Fetch error:", mailError);
            return res.send({ code: 0, msg: "Failed to send reset email" });
        }
    }
    catch (error) {
        console.log("Forgot Password Error:", error)
        return res.send({ code: -1, msg: "Server error" })
    }
}
const verifyResetToken = async (req, res) => {
    try {
        const record = await resetPassModel.findOne({ token: req.params.token })
        if (!record) {
            return res.send({ code: 0, msg: "Invalid token" })
        }
        const currentTime = new Date();
        if (currentTime > record.exptime) {
            return res.send({ code: 0, msg: "Token expired" })
        }

        res.send({ code: 1, username: record.username })
    } catch (e) {
        res.send({ code: 0, msg: "Error verifying token" })
    }
}
const forgotPassword = async (req, res) => {
    try {
        const { token, newpassword } = req.body
        // hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        // find + delete in one step
        const record = await resetPassModel.findOne({ token: hashedToken })
        if (!record) {
            return res.send({ code: 0, msg: "Invalid token" })
        }
        const currentTime = new Date()
        if (currentTime > record.exptime) {
            return res.send({ code: 0, msg: "Token expired" })
        }
        // only now delete it
        await resetPassModel.deleteOne({ token: hashedToken })
        // Update password
        const hashedPassword = await bcrypt.hash(newpassword, 10)
        await Registermodel.findOneAndUpdate(
            { username: record.username },
            { $set: { pass: hashedPassword } }
        )

        res.send({ code: 1, msg: "Password updated successfully" })

    } catch (e) {
        res.send({ code: 0, msg: "Error resetting password" })
    }
}
module.exports = { forgotPassword, verifyResetToken, resetPassword}