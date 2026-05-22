const Ordermodel = require("../models/Ordermodel")
const Cartmodel = require("../models/Cartmodel")
const Productmodel = require("../models/Productmodel")
const saveOrder =  async (req, res) => {
    try {
        const cartitems = await Cartmodel.find({ username: req.user.username })
        const formattedItems = await Promise.all(
            cartitems.map(async (item) => {
                const product = await Productmodel.findById(item.prodid)

                if (!product) {
                    throw new Error("Product not found")
                }
                return {
                    prodid: item.prodid,
                    prodname: product.prodname,   // safer from DB
                    qty: item.qty,
                    rate: product.rate,          // ✅ real price from DB
                    picname: product.picname || "defaultpic.webp"
                }
            })
        )
        const realTotal = formattedItems.reduce(
            (sum, item) => sum + item.rate * item.qty, 0)

        if (req.body.billamt && realTotal !== Number(req.body.billamt)) {
            console.warn("Price mismatch detected", {
                frontend: req.body.billamt,
                backend: realTotal
            })
        }
        // const currentDateUTC = new Date(); // Get the current date in UTC
        // const ISTOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
        // const currentDateIST = new Date(currentDateUTC.getTime() + ISTOffset); // Convert to IST
        const newrecord = Ordermodel({
            uname: req.user.username,
            billamt: realTotal,
            pmode: req.body.pmode?.toUpperCase(),
            cardinfo: req.body.cardinfo,
            addrinfo: req.body.addrinfo,
            status: "PROCESSING",
            orderitems: formattedItems
        })

        const result = await newrecord.save();
        if (result) {
            for (var x = 0; x < cartitems.length; x++) {
                await Productmodel.updateOne({ _id: cartitems[x].prodid }, { $inc: { "stock": -cartitems[x].qty } })
            }
            await Cartmodel.deleteMany({ username: req.user.username })
            res.send({ code: 1, total: realTotal })
        }
        else {
            res.send({ code: 0 })
        }

    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const fetchOrderSummary = async (req, res) => {
    try {
        const result = await Ordermodel.findOne({ uname: req.user.username }).sort({ createdAt: -1 })

        if (!result) {
            return res.send({ code: 0, msg: "No orders found" })
        }
        res.send({ code: 1, odata: result })
    } catch (e) {
        console.log("Fetch order error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const getUserOrders = async (req, res) => {
    try {
        const result = await Ordermodel.find({ uname: req.user.username }).sort({ createdAt: -1 })

        if (!result || result.length === 0) {
            return res.send({ code: 0, msg: "No orders found" })
        }
        res.send({ code: 1, ordersdata: result })
    } catch (e) {
        console.log("Get user order error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const getOrders =  async (req, res) => {
    try {
        const { stdate, enddate } = req.query

        // 🔴 Validate input
        if (!stdate || !enddate) {
            return res.send({ code: 0, msg: "Start date and end date are required" })
        }

        // 🔵 Convert to full-day range (safe format)
        const startDate = new Date(stdate)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(enddate)
        endDate.setHours(23, 59, 59, 999)

        // 🔍 Fetch orders
        const result = await Ordermodel.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort({ createdAt: -1 })

        if (!result || result.length === 0) {
            return res.send({ code: 0, msg: "No orders found in this date range" })
        }
        res.send({ code: 1, ordersdata: result })

    } catch (e) {
        console.log("Get orders error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const getOrderItems =  async (req, res) => {
    try {
        const { oid } = req.query

        // 🔴 Validate input
        if (!oid) {
            return res.send({ code: 0, msg: "Order ID is required" })
        }
        // ✅ If admin → allow all orders
        if (req.user.usertype === "admin") {
            result = await Ordermodel.findById(oid)
        }
        else {
            // ✅ Normal user → only their orders
            result = await Ordermodel.findOne({
                _id: oid,
                uname: req.user.username
            })
        }

        if (!result) {
            return res.send({ code: 0, msg: "Order not found" })
        }
        res.send({ code: 1, oitems: result.orderitems })

    } catch (e) {
        console.log("Get order items error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const updateStatus =  async (req, res) => {
    try {
        const { oid, newstatus } = req.body
        const status = newstatus.toUpperCase().trim()

        if (!oid || !newstatus) {
            return res.send({ code: 0, msg: "Missing order ID or status" })
        }
        const allowed = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "IN-TRANSIT", "OUT FOR DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"]

        if (!allowed.includes(status)) {
            return res.send({ code: 0, msg: "Invalid status" })
        }
        const result = await Ordermodel.updateOne(
            { _id: oid },
            { $set: { status: status } }   // 👈 good practice
        )

        // 🔍 Check if order existed & was matched
        if (result.matchedCount === 0) {
            return res.send({ code: 0, msg: "Order not found" })
        }

        // 🔍 Check if actually updated
        if (result.modifiedCount === 0) {
            return res.send({ code: 0, msg: "Status already set" })
        }
        res.send({ code: 1, msg: "Order status updated successfully", status: status })

    } catch (e) {
        console.log("Update status error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
module.exports = { saveOrder, getUserOrders, fetchOrderSummary, getOrders, getOrderItems, updateStatus}