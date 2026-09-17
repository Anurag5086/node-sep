const User = require('../models/User')

exports.createUser = async (req, res) => {
    const { name, email, phone } = req.body

    const user = await User.findOne({ email })
    if(user){
        res.status(400).json({ success: false, message: "User already exists!" })
    }

    const newUser = new User({
        name,
        email,
        phone
    })

    await newUser.save()

    res.status(201).json({ success: true, message: 'User created successfully!' })
}

exports.getUserById = async (req, res) => {
    const userId = req.params.id

    const user = await User.findById(userId)
    if(!user){
        res.status(404).json({ success: false, message: "User not found!" })
    }

    res.status(200).json({ success: true, message: "user fetched succesfully!", user })
}

exports.updateUser = async (req, res) => {
    const userId = req.params.id

    const user = await User.findById(userId)
    if(!user){
        res.status(404).json({ success: false, message: "User not found!" })
    }

    const { name, email, phone } = req.body

    await User.findByIdAndUpdate(userId, { name, email, phone })

    res.status(200).json({ success: true, message: "User updated successfully!" })
}

exports.deleteUser = async (req, res) => {
    const userId = req.params.id

    const user = await User.findById(userId)
    if(!user){
        res.status(404).json({ success: false, message: "User not found!" })
    }

    await User.findByIdAndDelete(userId)

    res.status(200).json({ success: true, message: "User deleted successfully!" })
}