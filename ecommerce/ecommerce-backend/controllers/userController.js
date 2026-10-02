const User = require('../models/User')

exports.getUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const user = await User.findById(userId).select('-password')
        if(!user){
            return res.status(404).json({ success: false, message: "User not found!" })
        }

        res.status(200).json({ success: true, message: "User fetched successfully!", user })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllUsers = async (req, res) => {
    try{
        const users = await User.find({ role: 'user' }).select('-password')
        res.status(200).json({ success: true, message: "Fetched all users!", users })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.updateUser = async (req, res) => {
    try{
        const { name, phoneNumber, address } = req.body

        const userId = req.user.userId

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({ success: false, message: "User not found!" })
        }

        await User.findByIdAndUpdate(userId, { name, phoneNumber, address })

        res.status(200).json({ success: true, message: "User updated successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.deleteUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({ success: false, message: "User not found!" })
        }

        await User.findByIdAndDelete(userId)

        res.status(200).json({ success: true, message: "User deleted successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}