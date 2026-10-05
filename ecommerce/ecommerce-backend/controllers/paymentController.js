const crypto = require('crypto')
const Razorpay = require('razorpay')
const Order = require('../models/Order')
const {
    validateAndPriceOrderLines,
    decrementStock,
} = require('../utils/orderHelpers')

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
        throw new Error('Razorpay is not configured on the server.')
    }
    return {
        client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
        keyId,
        keySecret,
    }
}

function pickItems(body) {
    return body.items ?? body.products
}

exports.createRazorpayOrder = async (req, res) => {
    try {
        const items = pickItems(req.body)
        const priced = await validateAndPriceOrderLines(items)
        if (priced.error) {
            return res.status(400).json({ success: false, message: priced.error })
        }

        const { client, keyId } = getRazorpayClient()
        const amountPaise = Math.round(priced.computedTotal * 100)

        if (amountPaise < 100) {
            return res.status(400).json({
                success: false,
                message: 'Minimum order amount for online payment is ₹1.',
            })
        }

        const razorpayOrder = await client.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: `luxemart_${Date.now()}`,
        })

        res.status(200).json({
            success: true,
            keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
            totalAmount: priced.computedTotal,
        })
    } catch (err) {
        const message =
            err.message === 'Razorpay is not configured on the server.'
                ? err.message
                : 'Could not create payment order.'
        res.status(500).json({ success: false, message, error: err.message })
    }
}

exports.verifyRazorpayCheckout = async (req, res) => {
    try {
        const items = pickItems(req.body)
        const {
            shippingAddress,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body
        const userId = req.user.userId

        if (!shippingAddress?.trim()) {
            return res.status(400).json({ success: false, message: 'Shipping address is required!' })
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Incomplete payment details!' })
        }

        const { keySecret } = getRazorpayClient()

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed!' })
        }

        const existing = await Order.findOne({ razorpayPaymentId: razorpay_payment_id })
        if (existing) {
            return res.status(400).json({ success: false, message: 'This payment was already processed.' })
        }

        const priced = await validateAndPriceOrderLines(items)
        if (priced.error) {
            return res.status(400).json({ success: false, message: priced.error })
        }

        const newOrder = new Order({
            userId,
            products: priced.orderProducts,
            totalAmount: priced.computedTotal,
            paymentMethod: 'Razorpay',
            shippingAddress: shippingAddress.trim(),
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            status: 'confirmed',
        })

        await newOrder.save()
        await decrementStock(priced.orderProducts)

        const order = await Order.findById(newOrder._id).populate('products.product')

        res.status(201).json({
            success: true,
            message: 'Payment verified and order placed!',
            order,
        })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Payment verification error!', error: err.message })
    }
}
