const express = require("express")
const router = express.Router()

const cartController = require("../controllers/Cartcontrollers")
const { verifytoken } = require("../middleware/Auth")

router.post("/addtocart", verifytoken, cartController.addToCart)
router.get("/getcart", verifytoken, cartController.getCart)
router.delete("/deletecart", verifytoken, cartController.deleteCart)

module.exports = router