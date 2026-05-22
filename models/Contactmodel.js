const mongoose = require("mongoose")
const ContactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                "Please enter a valid email address"
            ]
        },

        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return !v || /^\d{10}$/.test(v);
                },
                message: "Phone number must be 10 digits"
            }
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters"],
            maxlength: [1000, "Message cannot exceed 1000 characters"]
        }
    },
    {
        timestamps: true,
        versionKey: false // 👈 removes __v field
    }
)
const Contactmodel = mongoose.model("Contact", ContactSchema, "Contact")
module.exports = Contactmodel