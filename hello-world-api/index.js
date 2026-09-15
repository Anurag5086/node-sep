const express = require('express')
const app = express()

app.get('/hello-world', (req, res) => {
    res.json({ message: "Hello World!" })
})

app.listen(3000, () => {
    console.log("Server is running at PORT: 3000")
})