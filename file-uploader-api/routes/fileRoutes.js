const express = require('express')
const upload = require('../middlewares/multerMiddleware')
const { uploadFile } = require('../controllers/fileControllers')
const router = express.Router()

router.post('/upload', upload.single('file'), uploadFile)

module.exports = router