const mongoose = require("mongoose")
const OrderSchema = new mongoose.Schema({
    uname: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Username must be at least 3 characters"]
    },
    billamt: {
        type: Number,
        required: [true, "Bill amount is required"],
        min: [0, "Bill amount cannot be negative"]
    },
    pmode: {
        type: String,
        required: [true, "Payment mode is required"],
        enum: ["COD", "CARD", "UPI", "NETBANKING"],
        uppercase: true
    },
    cardinfo: {
        type: Object,
        default: null
    },
    addrinfo: {
        type: Object,
        required: [true, "Address information is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "IN-TRANSIT", "OUT FOR DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"],
        default: "PENDING"
    },
    orderitems: {
        type: [
            {
                prodid: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true
                },
                prodname: {
                    type: String,
                    required: true,
                    trim: true
                },
                qty: {
                    type: Number,
                    required: true,
                    min: 1
                },
                rate: {
                    type: Number,
                    required: true,
                    min: 0
                },
                picname: {
                    type: String,
                    default: "defaultpic.webp"
                }
            }
        ],
        required: [true, "Order items are required"],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: "Order must contain at least one item"
        }
    }
}, {
    versionKey: false,
    timestamps: true   // 👈 adds createdAt & updatedAt
})

const Ordermodel = mongoose.model('order', OrderSchema, 'order')
module.exports = Ordermodel