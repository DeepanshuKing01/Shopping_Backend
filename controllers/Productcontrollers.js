const fs = require("fs")
const Productmodel = require("../models/Productmodel")
const addProduct = async (req, res) => {
    try {
        if (!req.body.cid || !req.body.scid || !req.body.pname) {
            return res.send({ code: 0, msg: "Missing required fields" })
        }
        if (isNaN(Number(req.body.rate)) || isNaN(Number(req.body.stock))) {
            return res.send({ code: 0, msg: "Invalid numeric values" })
        }
        if (Number(req.body.rate) < 0 || Number(req.body.stock) < 0) {
            return res.send({ code: 0, msg: "Negative values not allowed" })
        }
        //it shows that there is file in the request and admin wants to add new image
        const fname = (req.files && req.files.pic)
            ? req.files.pic[0].filename
            : "defaultpic.webp"

        const extraimgs = req.files?.extraimages
            ? req.files.extraimages
                .map(file => file.filename)
                .filter(v => v && v.trim() !== "")
            : []
        const newrecord = Productmodel({ catid: req.body.cid, subcatid: req.body.scid, prodname: req.body.pname, rate: req.body.rate, discount: req.body.discount, description: req.body.description, stock: req.body.stock, featured: req.body.featured === "true" || req.body.featured === true, picname: fname, extraimages: extraimgs })
        const result = await newrecord.save()  //saving document to real collection
        if (result) {
            res.send({ code: 1 })
        }
        else {
            res.send({ code: 0 })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const getProductBySubcat = async (req, res) => {
    try {
        if (!req.query.scid) {
            return res.send({ code: 0, msg: "Missing subcategory id" })
        }
        const result = await Productmodel.find({ subcatid: req.query.scid })

        if (result.length == 0) {
            res.send({ code: 0 })
        }
        else {
            res.send({ code: 1, pdata: result })
        }

    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const getFeaturedProducts = async (req, res) => {
    try {
        const result = await Productmodel.find({ featured: true }).limit(6)
        // const result=await ProductModel.find().sort({"addedon":-1}).lmit(6)
        // console.log(result)
        if (result.length == 0) {
            res.send({ code: 0 })
        }
        else {
            res.send({ code: 1, pdata: result })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const getLatestProducts = async (req, res) => {
    try {
        const data = await Productmodel.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .select("prodname picname rate createdAt")
        // console.log("LATEST PRODUCTS:", data)

        return res.json({ code: 1, pdata: data })
    } catch (err) {
        return res.json({ code: 0, msg: err.message })
    }
}
const getUpdatedProducts = async (req, res) => {
    try {
        const products = await Productmodel.find()
            .sort({ updatedAt: -1 })
            .limit(6)
            .select("prodname picname rate updatedAt")
        // console.log("UPDATED PRODUCTS:", products)

        res.json({ code: 1, pdata: products });
    } catch (err) {
        res.json({ code: 0, msg: err.message });
    }
}
const updateProduct = async (req, res) => {
    try {

        let imagename
        let extraimgs = []

        // primary image
        if (req.files && req.files.pic) {
            imagename = req.files.pic[0].filename

            if (req.body.oldpicname !== "defaultpic.webp") {
                const oldPath = `public/uploads/${req.body.oldpicname}`
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath)
                }
            }
        } else {
            imagename = req.body.oldpicname
        }

        // extra images
        if (req.files?.extraimages) {
            extraimgs = req.files.extraimages.map(file => file.filename).filter(v => v && v.trim() !== "")
        }
        const existing = await Productmodel.findById(req.body.pid)

        const updatedImages = [
            ...(existing.extraimages || []),
            ...extraimgs
        ]
        if (Number(req.body.rate) < 0 || Number(req.body.stock) < 0) {
            return res.send({ code: 0, msg: "Negative values not allowed" })
        }

        const result = await Productmodel.updateOne(
            { _id: req.body.pid }, { catid: req.body.cid, subcatid: req.body.scid, prodname: req.body.pname, rate: req.body.rate, discount: req.body.discount, description: req.body.description, stock: req.body.stock, featured: req.body.featured === "true" || req.body.featured === true, picname: imagename, ...(extraimgs.length > 0 && { extraimages: updatedImages }) }
        )
        if (result.modifiedCount  > 0) {
            res.send({ code: 1 })
        }
        else {
            res.send({ code: 0 })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const deleteProduct = async (req, res) => {
    try {

        const pdata = await Productmodel.findOne({ _id: req.query.pid })

        if (!pdata) {
            res.send({ code: 0 })
            return
        }
        const defaultImage = "defaultpic.webp"

        if (pdata.picname && pdata.picname !== defaultImage) {
            const filepath = `public/uploads/${pdata.picname}`
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath)
            }
        }
        if (pdata.extraimages && pdata.extraimages.length > 0) {
            pdata.extraimages.forEach(img => {
                const filepath = `public/uploads/${img}`
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath)
                }
            })
        }
        const result = await Productmodel.deleteOne({ _id: req.query.pid })

        if (result.deletedCount === 1) {
            res.send({ code: 1 })
        }
        else {
            res.send({ code: 0 })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const getProductDetail = async (req, res) => {
    try {
        const result = await Productmodel.findById(req.params.pid)
        if (!result) {
            res.send({ code: 0 })
        }
        else {
            res.send({ code: 1, pdata: result })
        }
    }
    catch (e) {
        res.send({ code: 0 })
    }
}
const searchProducts = async (req, res) => {
    try {
        var searchtext = req.query.s || ""
        const result = await Productmodel.find({ prodname: { $regex: '.*' + searchtext, $options: 'i' } })
        if (result.length > 0) {
            res.send({ code: 1, pdata: result })
        }
        else {
            res.send({ code: 0 })
        }
    }
    catch (e) {
        res.send({ code: 0, errmsg: e.message })
    }
}
module.exports = { addProduct, getProductBySubcat, getFeaturedProducts, getLatestProducts, getUpdatedProducts, updateProduct, deleteProduct, getProductDetail, searchProducts }