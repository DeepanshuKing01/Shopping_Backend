// const nodemailer = require("nodemailer")
// const email = process.env.SMTP_UNAME
// const password = process.env.SMTP_PASS
// const service = process.env.SMTP_SERVICE
// // Validate ENV
// if (!email || !password || !service) {
//     throw new Error("Missing SMTP configuration in .env")
// }
// // SMTP configurations
// const smtpConfig = {
//     gmail: { host: "smtp.gmail.com", port: 465, secure: true },
//     outlook: { host: "smtp.office365.com", port: 587, secure: false },
//     yahoo: { host: "smtp.mail.yahoo.com", port: 465, secure: true },
//     apple: { host: "smtp.mail.me.com", port: 587, secure: false },
//     hostinger: { host: "smtp.hostinger.com", port: 465, secure: true }
// }
// // Select config
// const selected = smtpConfig[service]

// if (!selected) {
//     throw new Error("Invalid SMTP_SERVICE in .env")
// }
// // Create transporter
// const transporter = nodemailer.createTransport({
//     ...selected,
//     auth: {
//         user: email,
//         pass: password
//     }
// })
// // Verify SMTP connection (optional)
// transporter.verify((err, success) => {
//     if (err) {
//         console.error("SMTP Error:", err)
//     } else {
//         console.log("SMTP Server is ready")
//     }
// })
// module.exports = transporter