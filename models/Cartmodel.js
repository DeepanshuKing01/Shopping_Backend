const mongoose = require("mongoose")
const CartSchema = new mongoose.Schema({
    prodid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: [true, "Product ID is required"]
    },
    prodname: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: [3, "Product name must be at least 3 characters"],
        maxlength: [100, "Product name cannot exceed 100 characters"],
        lowercase: true
    },
    picname: {
        type: String,
        trim: true,
        default: "defaultpic.webp",
        set: v => (!v ? "defaultpic.webp" : v),
        validate: {
            validator: v => /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(v),
            message: "Image must be a valid format"
        }
    },
    rate: {
        type: Number,
        required: [true, "Product rate is required"],
        min: [0, "Rate cannot be negative"]
    },
    qty: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1
    },
    tcost: {
        type: Number,
        required: [true, "Total cost is required"],
        min: [0, "Total cost cannot be negative"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Username must be at least 3 characters"]
    }
}, { versionKey: false })
const Cartmodel = mongoose.model('cart', CartSchema, 'cart')
module.exports = Cartmodel
