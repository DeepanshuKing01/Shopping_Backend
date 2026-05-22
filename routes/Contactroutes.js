const express = require("express")

const router = express.Router()

const contactController = require("../controllers/Contactcontrollers")

router.post( "/contactus", contactController.contactUs)

module.exports = router