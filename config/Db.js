const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        // Use the environment variable instead of the hardcoded string
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected!")
    }
    catch (err) {
        console.log("MongoDB not connected", err)
        process.exit(1)
    }
}

module.exports = connectDB