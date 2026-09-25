const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const fileRoutes = require('./routes/fileRoutes')

app.use('/api', fileRoutes)
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB!'))
        .catch((err) => console.log('Failed to connect to MongoDB!', err))

app.listen(process.env.PORT, () => {
    console.log("Server is running at PORT: ", process.env.PORT)
})