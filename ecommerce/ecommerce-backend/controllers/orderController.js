const Order = require('../models/Order')
const Product = require('../models/Product')

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find().populate('products.product').populate('userId', 'name email').sort({ createdAt: -1 })
        if(orders.length < 1){
            res.status(404).json({ success: false, message: "No orders found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched orders!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getAllOrdersForUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const orders = await Order.find({ userId }).populate('products.product').populate('userId', 'name email').sort({ createdAt: -1 })
        if(orders.length < 1){
            res.status(404).json({ success: false, message: "No orders found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched orders for user!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getOrderById = async (req, res) => {
    try{
        const id = req.params.id

        const order = await Order.findById(id).populate('products.product')
        if(!order){
            res.status(404).json({ success: false, message: "No order found!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched order!", order })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.createOrder = async (req, res) => {
    try{
        const { products, totalAmount, paymentMethod, razorpayPaymentId, razorpayOrderId, shippingAddress } = req.body
        const userId = req.user.userId

        products.map(async (productId) => {
            const productData = await Product.findById(productId)
            if(!productData){
                return res.status(404).json({ success: false, message: "No product found!" })
            }
        })

        const newOrder = new Order({
            userId,
            products,
            totalAmount,
            paymentMethod,
            razorpayOrderId: razorpayOrderId || null,
            razorpayPaymentId: razorpayPaymentId || null,
            shippingAddress
        })

        await newOrder.save()

        res.status(201).json({ success: true, message: "Successfully created the order!", order: newOrder })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.updateOrderStatus = async (req, res) => {
    try{
        const orderId = req.params.id
        const { status } = req.body

        const order = await Order.findById(orderId)
        if(!order){
            res.status(404).json({ success: false, message: "No order found!" })
        }

        await Order.findByIdAndUpdate(orderId, { status })

        res.status(200).json({ success: true, message: "Order status updated successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}