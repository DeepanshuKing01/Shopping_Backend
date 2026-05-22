const express = require("express")
const router = express.Router()

const productController = require("../controllers/Productcontrollers")
const { verifytoken, verifyAdmin } = require("../middleware/Auth")
const upload = require("../utils/Multerconfig")

router.post( "/addproduct", verifytoken, verifyAdmin, upload.fields([{ name: "pic", maxCount: 1 }, { name: "extraimages", maxCount: 10 }]), productController.addProduct)
router.get("/getproductbysubcat", productController.getProductBySubcat)
router.get("/getfeatprods", productController.getFeaturedProducts)
router.get("/getlatestprods", productController.getLatestProducts)
router.get("/getupdatedprods", productController.getUpdatedProducts)
router.put( "/updateproduct", verifytoken, verifyAdmin, upload.fields([{ name: "pic", maxCount: 1 }, { name: "extraimages", maxCount: 10 }]), productController.updateProduct)
router.delete("/delproduct", verifytoken, verifyAdmin, productController.deleteProduct)
router.get("/getproddetail/:pid", productController.getProductDetail)
router.get("/searchproducts", productController.searchProducts)

module.exports = router