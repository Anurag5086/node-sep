const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "uploads/")
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() + 1E9) // 1000000000
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 1MB = 1024KB
    }
})

module.exports = upload