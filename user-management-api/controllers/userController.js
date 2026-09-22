const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const joi = require('joi')

exports.registerUser = async (req, res) => {
    try{
        const { name, email, password } = req.body

        const schema = joi.object({
            name: joi.string().required(),
            email: joi.string().email().required(),
            password: joi.string().required()
        })

        const { error } = schema.validate({ name, email, password })
        if(error){
            res.status(400).json({ success: false, message: "Input is Invalid!", error })
        }

        const user = await User.findOne({ email })
        if(user){
            res.status(400).json({ succes: false, message: "Email already registered!" })
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALTS))

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()

        res.status(201).json({ success: true, message: "User registered successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err })
    }
}

exports.loginUser = async (req, res) => {
    try{
        const { email, password } = req.body

        const schema = joi.object({
            email: joi.string().required(),
            password: joi.string().required()
        })

        const { error } = schema.validate({ email, password })
        if(error){
            res.status(400).json({ success: false, message: "Input is Invalid!", error })
        }

        const user = await User.findOne({ email })
        if(!user){
            res.status(400).json({ succes: false, message: "Email not registered!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            res.status(400).json({ success: false, message: "Incorrect Password!" })
        }

        const token = jwt.sign({
            userId: user._id,
            role: user.role,
            userEmail: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax"
        }).status(200).json({ success: true, message: "Logged In Successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err })
    }
}