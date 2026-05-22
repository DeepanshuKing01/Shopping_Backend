const multer = require('multer')
const mystorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fname = Date.now() + Math.round(Math.random() * 1E9) + file.originalname
        cb(null, fname)
    }
})

const upload = multer({ storage: mystorage })
module.exports = upload