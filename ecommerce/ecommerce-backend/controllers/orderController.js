const Order = require('../models/Order')
const {
    validateAndPriceOrderLines,
    decrementStock,
} = require('../utils/orderHelpers')

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find()
            .populate('products.product')
            .populate('userId', 'name email phoneNumber')
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, message: "Successfully fetched orders!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getAllOrdersForUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const orders = await Order.find({ userId })
            .populate('products.product')
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, message: "Successfully fetched orders for user!", orders })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.getOrderById = async (req, res) => {
    try{
        const id = req.params.id

        const order = await Order.findById(id)
            .populate('products.product')
            .populate('userId', 'name email phoneNumber')

        if(!order){
            return res.status(404).json({ success: false, message: "No order found!" })
        }

        const ownerId = order.userId?._id?.toString() ?? order.userId?.toString()
        const isOwner = ownerId === req.user.userId
        const isAdmin = req.user.role === 'admin'
        if(!isOwner && !isAdmin){
            return res.status(403).json({ success: false, message: "Access denied!" })
        }

        res.status(200).json({ success: true, message: "Successfully fetched order!", order })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}

exports.createOrder = async (req, res) => {
    try{
        const {
            products,
            totalAmount,
            paymentMethod,
            razorpayPaymentId,
            razorpayOrderId,
            shippingAddress,
        } = req.body
        const userId = req.user.userId

        if(!Array.isArray(products) || products.length < 1){
            return res.status(400).json({ success: false, message: "Cart is empty!" })
        }

        if(!shippingAddress?.trim()){
            return res.status(400).json({ success: false, message: "Shipping address is required!" })
        }

        if(!paymentMethod || !['COD', 'Razorpay'].includes(paymentMethod)){
            return res.status(400).json({ success: false, message: "Invalid payment method!" })
        }

        if (paymentMethod === 'Razorpay') {
            return res.status(400).json({
                success: false,
                message: 'Use the Razorpay checkout flow for online payments.',
            })
        }

        const priced = await validateAndPriceOrderLines(products)
        if (priced.error) {
            const status = priced.error.includes('unavailable') ? 404 : 400
            return res.status(status).json({ success: false, message: priced.error })
        }

        const { orderProducts, computedTotal } = priced

        if(typeof totalAmount === 'number' && Math.abs(computedTotal - totalAmount) > 1){
            return res.status(400).json({ success: false, message: "Order total mismatch. Please refresh and try again." })
        }

        const newOrder = new Order({
            userId,
            products: orderProducts,
            totalAmount: computedTotal,
            paymentMethod,
            shippingAddress: shippingAddress.trim(),
            razorpayOrderId: razorpayOrderId || null,
            razorpayPaymentId: razorpayPaymentId || null,
            status: 'pending',
        })

        await newOrder.save()
        await decrementStock(orderProducts)

        const order = await Order.findById(newOrder._id).populate('products.product')

        res.status(201).json({ success: true, message: "Successfully created the order!", order })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!', error: err.message })
    }
}

exports.updateOrderStatus = async (req, res) => {
    try{
        const orderId = req.params.id
        const { status } = req.body

        const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if(!status || !allowed.includes(status)){
            return res.status(400).json({ success: false, message: "Invalid order status!" })
        }

        const order = await Order.findById(orderId)
        if(!order){
            return res.status(404).json({ success: false, message: "No order found!" })
        }

        await Order.findByIdAndUpdate(orderId, { status })

        res.status(200).json({ success: true, message: "Order status updated successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!' })
    }
}
