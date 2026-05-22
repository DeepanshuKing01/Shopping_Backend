const mongoose = require("mongoose")
const resetPassSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Username must be a valid email address"]
    },
    token: {
        type: String,
        required: [true, "Reset token is required"],
        minlength: [36, "Invalid token format"], // UUID length
    },
    exptime: {
        type: Date,
        required: [true, "Expiration time is required"],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: "Expiration time must be in the future"
        }
    }
}, { versionKey: false });
resetPassSchema.index({ exptime: 1 }, { expireAfterSeconds: 0 })
const resetPassModel = mongoose.model("resetpass", resetPassSchema, "resetpass")
module.exports = resetPassModel