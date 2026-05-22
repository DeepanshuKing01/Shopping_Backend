const express = require('express')
const app = express()
app.use(express.json())
const port = 9000
require('dotenv').config()
const connectDB = require("./config/Db")
connectDB()
var cors = require('cors')
// app.use(cors())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

const cookieParser = require("cookie-parser")
app.use(cookieParser())
const authRoutes = require("./routes/Authroutes")
const adminRoutes = require("./routes/Adminroutes")
const passwordRoutes = require("./routes/Passroutes")
const categoryRoutes = require("./routes/Categoryroutes")
const subCategoryRoutes = require("./routes/Subcategoryroutes")
const productRoutes = require("./routes/Productroutes")
const cartRoutes = require("./routes/Cartroutes")
const orderRoutes = require("./routes/Orderroutes")
const contactRoutes = require("./routes/Contactroutes")
const emailRoutes = require("./routes/Emailroutes")

app.use("/api", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api", passwordRoutes)
app.use("/api", categoryRoutes)
app.use("/api", subCategoryRoutes)
app.use("/api", productRoutes)
app.use("/api", cartRoutes)
app.use("/api", orderRoutes)
app.use("/api", contactRoutes)
app.use("/api/email", emailRoutes)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
