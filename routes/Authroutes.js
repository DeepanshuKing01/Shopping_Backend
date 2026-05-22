const express = require("express")
const router = express.Router()

const authController = require("../controllers/Authcontrollers")
const { verifytoken } = require("../middleware/Auth")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/activateaccount", authController.activateaccount)
router.post("/resendactivation", authController.resendactivation)
router.get("/check-auth", verifytoken, authController.checkAuth)
router.post("/logout", authController.logout)
router.put("/changepassword", verifytoken, authController.changePassword)

module.exports = router