const mongoose = require("mongoose")
const Categoryschema = new mongoose.Schema({     //this is structure of document
    catname: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        minlength: [3, "Category name must be at least 3 characters"],
        maxlength: [50, "Category name cannot exceed 50 characters"],
        match: [/^[A-Za-z0-9\s&-]+$/, "Category name can contain letters, numbers, spaces, & and -"],
        unique: true
    },
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
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
Categoryschema.virtual("subcategories", {
    ref: "subcategory",
    localField: "_id",
    foreignField: "catid"
})
const Categorymodel = mongoose.model('category', Categoryschema, 'category')
module.exports = Categorymodel