const mongoose = require("mongoose")
const SubCategoryschema = new mongoose.Schema({
    catid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: [true, "Category ID is required"]
    },
    subcatname: {
        type: String,
        required: [true, "Subcategory name is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Subcategory name must be at least 3 characters"],
        maxlength: [50, "Subcategory name cannot exceed 50 characters"],
        match: [/^[A-Za-z0-9\s&-]+$/, "Subcategory name can contain letters, numbers, spaces, & and -"]
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
}, { versionKey: false })

// 🔒 Prevent duplicate subcategory names within same category
SubCategoryschema.index({ catid: 1, subcatname: 1 }, { unique: true });
const SubCategorymodel = mongoose.model('subcategory', SubCategoryschema, 'subcategory')
module.exports = SubCategorymodel