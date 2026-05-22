// Import the transporter from your utils folder
const transporter = require('../utils/Mailer');

// controllers/Emailcontrollers.js
const sendEmail = async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    // Call your new external microservice!
    const response = await fetch(process.env.MICROSERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MICROSERVICE_SECRET_KEY}`
      },
      body: JSON.stringify({ to, subject, html })
    });

    const data = await response.json();

    if (!data.success) throw new Error(data.error);

    res.status(200).json({ success: true, msg: "Email sent via microservice" });
  } catch (error) {
    console.error("Microservice Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { sendEmail };