const Contactmodel = require("../models/Contactmodel")
// const transporter = require("../utils/Mailer")
const contactUs = async (req, res) => {
    try {
        const { name, email, phone, message, captcha } = req.body

        // ✅ 1. Basic validation
        if (!name || !email || !phone || !message) {
            return res.send({ code: 0, msg: "All fields are required" })
        }

        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.send({ code: 0, msg: "Invalid email format" })
        }

        if (!captcha) {
            return res.send({ code: 0, msg: "Captcha is required" })
        }

        // ✅ 2. Verify CAPTCHA
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

        const captchaData = await captchaRes.json();

        if (!captchaData.success) {
            return res.send({ code: 0, msg: "Captcha verification failed" })
        }

        // ✅ 3. Save to DB FIRST
        const savedContact = await Contactmodel.create({
            name,
            email,
            phone,
            message
        });
        try {
            const response = await fetch(process.env.MICROSERVICE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`
                },
                body: JSON.stringify({
                    to: process.env.SMTP_UNAME, // Sending the email to yourself
                    replyTo: email, // See important note below!
                    subject: "Message from Website - Contact Us",
                    html: `
                        <b>Name:</b> ${name}<br/>
                        <b>Phone:</b> ${phone}<br/>
                        <b>Email:</b> ${email}<br/>
                        <b>Message:</b><br/>${message}
                    `
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            console.log("Email sent via microservice");
            return res.send({ code: 1, msg: "Message saved and sent successfully" })

        } catch (mailError) {
            console.log("Email failed but data saved:", mailError)
            return res.send({ code: 1, msg: "Message saved but email failed" })
        }
        // ✅ 4. Send Email (async/await — no callback)
        // const mailOptions = {
        //     from: `"Website Contact" <${process.env.SMTP_UNAME}>`,
        //     to: process.env.SMTP_UNAME,
        //     replyTo: email,
        //     subject: "Message from Website - Contact Us",
        //     html: `
        //         <b>Name:</b> ${name}<br/>
        //         <b>Phone:</b> ${phone}<br/>
        //         <b>Email:</b> ${email}<br/>
        //         <b>Message:</b><br/>${message}
        //     `
        // };

        // try {
        //     const info = await transporter.sendMail(mailOptions)
        //     console.log("Email sent:", info.response)

        //     return res.send({ code: 1, msg: "Message saved and sent successfully"})

        // } catch (mailError) {
        //     console.log("Email failed but data saved:", mailError)

        //     return res.send({ code: 1, msg: "Message saved but email failed"})
        // }

    } catch (error) {
        console.error("Contact Us Error:", error)

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(e => e.message)
            return res.send({ code: 0, msg: messages[0] })
        }

        return res.send({ code: -1, msg: "Server error" })
    }
}
module.exports = { contactUs }