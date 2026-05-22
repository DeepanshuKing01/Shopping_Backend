const express = require("express")
const router = express.Router()

const SubCategorycontroller = require("../controllers/Subcategorycontrollers")

const { verifytoken, verifyAdmin } = require("../middleware/Auth")
const upload = require("../utils/Multerconfig")

router.post("/addsubcategory",verifytoken,verifyAdmin,upload.single("pic"),SubCategorycontroller.addSubCategory)
router.get("/getallsubcats", SubCategorycontroller.getAllSubCategories)
router.get("/getsubcatbycat", SubCategorycontroller.getSubCatByCategory)
router.put("/updatesubcategory",verifytoken,verifyAdmin,upload.single("pic"),SubCategorycontroller.updateSubCategory)
router.delete("/delsubcategory",verifytoken,verifyAdmin,SubCategorycontroller.deleteSubCategory)

module.exports = router