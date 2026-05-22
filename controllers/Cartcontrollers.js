const Cartmodel = require("../models/Cartmodel")
const Productmodel = require("../models/Productmodel")
const addToCart = async (req, res) => {
    try {
        const { prodid, qty } = req.body

        // 🔹 Basic validation
        if (!prodid || !qty || qty < 1) {
            return res.send({ code: 0, msg: "Invalid product or quantity" })
        }

        // 🔹 Get product details from DB (DON'T trust frontend)
        const product = await Productmodel.findById(prodid)

        if (!product) {
            return res.send({ code: 0, msg: "Product not found" })
        }
        if (qty > product.stock) {
            return res.send({ code: 0, msg: "Insufficient stock" })
        }

        // 🔹 Check if already in cart
        const existingItem = await Cartmodel.findOne({
            prodid,
            username: req.user.username
        })

        if (existingItem) {
            // ✅ calculate new quantity
            const newQty = existingItem.qty + Number(qty)

            // ✅ stock validation
            if (newQty > product.stock) {
                return res.send({ code: 0, msg: "Stock limit exceeded" })
            }

            // ✅ update values
            existingItem.qty = newQty
            existingItem.tcost = newQty * product.rate

            await existingItem.save()
            return res.send({ code: 1, msg: "Cart updated" })
        }

        // 🔹 Create new cart item
        const newrecord = new Cartmodel({
            prodid: product._id,
            prodname: product.prodname,
            picname: product.picname,
            rate: product.rate,
            qty: Number(qty),
            tcost: product.rate * qty,
            username: req.user.username   // ✅ no DB call needed
        })

        await newrecord.save()

        res.send({ code: 1, msg: "Added to cart" })

    } catch (e) {
        console.log("Add to cart error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const getCart = async (req, res) => {
    try {
        const username = req.user.username

        // 🔹 fetch cart directly using token data
        const cartdata = await Cartmodel.find({ username })
        res.send({ code: 1, cartdata })
    } catch (e) {
        console.log("Get cart error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
const deleteCart = async (req, res) => {
    try {
        const username = req.user.username
        const cartId = req.query.id

        if (!cartId) {
            return res.send({ code: 0, msg: "Cart item id required" })
        }
        const result = await Cartmodel.deleteOne({ _id: cartId, username })

        if (result.deletedCount === 1) {
            return res.send({ code: 1, msg: "Item removed from cart" })
        } else {
            return res.send({ code: 0, msg: "Item not found" })
        }

    } catch (e) {
        console.log("Delete cart error:", e)
        res.send({ code: 0, msg: e.message })
    }
}
module.exports = { addToCart, getCart, deleteCart }