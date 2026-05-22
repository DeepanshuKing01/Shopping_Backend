const mongoose = require("mongoose")
const Productschema = new mongoose.Schema({
    catid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: [true, "Category ID is required"]
    },
    subcatid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory',
        required: [true, "Subcategory ID is required"]
    },
    prodname: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Product name must be at least 3 characters"],
        maxlength: [100, "Product name cannot exceed 100 characters"],
        match: [/^[A-Za-z0-9\s&-]+$/, "Product name can contain letters, numbers, spaces, & and -"]
    },
    rate: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock cannot be negative"],
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // subcatname: {
    //     type: String,
    //     trim: true,
    //     lowercase: true
    // },
    picname: {
        type: String,
        trim: true,
        default: "defaultpic.webp",
        set: v => (!v ? "defaultpic.webp" : v),
        validate: {
            validator: function (v) {
                if (!v || v === "defaultpic.webp") return true;
                return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(v);
            },
            message: "Image must be a valid format"
        }
    },
    extraimages: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                if (!arr || arr.length === 0) return true

                return arr.filter(v => v && v.trim() !== "") // remove empty values
                    .every(v => /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(v))
            },
            message: "Invalid image format"
        }
    },
}, {
    versionKey: false, timestamps: true   // 👈 adds createdAt & updatedAt
})
const Productmodel = mongoose.model('product', Productschema, 'product')
module.exports = Productmodel
