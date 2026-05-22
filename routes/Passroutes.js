const express = require("express")
const router = express.Router()

const passwordController = require("../controllers/Passcontrollers")

router.post("/forgotpassword", passwordController.forgotPassword)
router.get("/verifytoken/:token", passwordController.verifyResetToken)
router.post("/resetpassword", passwordController.resetPassword)

module.exports = router