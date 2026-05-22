const express = require("express")
const router = express.Router()

const orderController = require("../controllers/Ordercontrollers")
const { verifytoken, verifyAdmin } = require("../middleware/Auth")

router.post("/saveorder", verifytoken, orderController.saveOrder)
router.get("/getuserorder", verifytoken, orderController.getUserOrders)
router.get("/fetchordersummary", verifytoken, orderController.fetchOrderSummary)
router.get("/getorders", verifytoken, verifyAdmin, orderController.getOrders)
router.get("/getorderitems", verifytoken, orderController.getOrderItems)
router.put("/updatestatus", verifytoken, verifyAdmin, orderController.updateStatus)

module.exports = router