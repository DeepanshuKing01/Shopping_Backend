const express = require('express');
const router = express.Router();

// Import the middleware from your Auth.js file
const { authenticateEmailRequest } = require('../middleware/Auth');
// Import the controller you just made
const { sendEmail } = require('../controllers/Emailcontrollers');

// Define the route: POST /api/email/send
router.post('/send', authenticateEmailRequest, sendEmail);

module.exports = router