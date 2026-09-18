const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Connected!'))
        .catch((err) => console.log("Failed to connect to MongoDB!", err))

app.listen(process.env.PORT, () => {
    console.log(`Server is running at PORT: ${process.env.PORT}`)
})