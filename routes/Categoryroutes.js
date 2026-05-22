const express = require("express")
const router = express.Router()

const Categorycontroller = require("../controllers/Categorycontrollers")

const { verifytoken, verifyAdmin } = require("../middleware/Auth")
const upload = require("../utils/Multerconfig") // your multer config

router.post("/addcategory",verifytoken,verifyAdmin,upload.single("pic"),Categorycontroller.addCategory)
router.get("/getallcats", Categorycontroller.getAllCategories)
router.get("/getallcategorieswithsubs", Categorycontroller.getAllCategoriesWithSubs)
router.put("/updatecategory",verifytoken,verifyAdmin,upload.single("pic"),Categorycontroller.updateCategory)
router.delete("/delcategory",verifytoken,verifyAdmin,Categorycontroller.deleteCategory)

module.exports = router