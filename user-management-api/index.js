const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const helmet = require('helmet')
const cors = require("cors")
const rateLimit = require('express-rate-limit')

// Security Headers
app.use(helmet())
app.use(cors({
    origin: "https://anuragfrontend.com"
}))
app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    message: {
        error: "Too many requests. Please try again!"
    }
}))

app.use(express.json())
app.use('/api', userRoutes)

mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Connected!'))
        .catch((err) => console.log("Failed to connect to MongoDB!", err))

app.listen(process.env.PORT, () => {
    console.log(`Server is running at PORT: ${process.env.PORT}`)
})