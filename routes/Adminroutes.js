const express = require("express")
const router = express.Router()

const adminController = require("../controllers/Admincontrollers")

const { verifytoken, verifyAdmin } = require("../middleware/Auth")

router.post("/createadmin",verifytoken,verifyAdmin,adminController.createAdmin)
router.get("/getallmembers",verifytoken,verifyAdmin,adminController.getAllMembers)
router.get("/getuserbyusername",verifytoken,verifyAdmin,adminController.getUserByUsername)
router.delete("/delmember",verifytoken,verifyAdmin,adminController.deleteMember)

module.exports = router