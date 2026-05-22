const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        // await mongoose.connect("mongodb://127.0.0.1:27017/shopworld_db")
        await mongoose.connect("mongodb://shoppinggtb_db_user:gtbdbpass2025@ac-w4dmk6k-shard-00-00.izw4nzt.mongodb.net:27017,ac-w4dmk6k-shard-00-01.izw4nzt.mongodb.net:27017,ac-w4dmk6k-shard-00-02.izw4nzt.mongodb.net:27017/shopworld_db?ssl=true&replicaSet=atlas-8jtmz6-shard-0&authSource=admin&appName=Cluster0shopping")
        console.log("MongoDB Connected!")
    }
    catch (err) {
        console.log("MongoDB not connected")
        process.exit(1)
    }
}

module.exports = connectDB