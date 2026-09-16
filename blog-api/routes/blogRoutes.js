const express = require('express')
const { getAllBlogs, getBlogById } = require('../controllers/blogController')
const router = express.Router()

router.get('/blogs', getAllBlogs)
router.get('/blog/:id', getBlogById)

module.exports = router