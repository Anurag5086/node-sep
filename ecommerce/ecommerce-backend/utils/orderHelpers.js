const Product = require('../models/Product')

function normalizeLineItems(rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length < 1) {
        return { error: 'Cart is empty!' }
    }

    const orderProducts = []
    let computedTotal = 0

    for (const item of rawItems) {
        const productId = item.product || item.productId
        const quantity = Number(item.quantity)

        if (!productId || !quantity || quantity < 1) {
            return { error: 'Invalid product in order!' }
        }

        orderProducts.push({ productId, quantity })
    }

    return { orderProducts, computedTotal: null }
}

async function validateAndPriceOrderLines(rawItems) {
    const normalized = normalizeLineItems(rawItems)
    if (normalized.error) return normalized

    let computedTotal = 0
    const orderProducts = []

    for (const { productId, quantity } of normalized.orderProducts) {
        const productData = await Product.findById(productId)
        if (!productData || !productData.isActive) {
            return { error: 'One or more products are unavailable!' }
        }

        if (productData.stockQuantity < quantity) {
            return {
                error: `Only ${productData.stockQuantity} left in stock for ${productData.title}`,
            }
        }

        computedTotal += productData.sellingPrice * quantity
        orderProducts.push({ product: productId, quantity })
    }

    return { orderProducts, computedTotal }
}

async function decrementStock(orderProducts) {
    for (const line of orderProducts) {
        await Product.findByIdAndUpdate(line.product, {
            $inc: { stockQuantity: -line.quantity },
        })
    }
}

module.exports = {
    validateAndPriceOrderLines,
    decrementStock,
}
