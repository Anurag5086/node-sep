const Product = require('../models/Product')

/** Primary + fallbacks when a model is overloaded (503) or retired (404). */
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest']

async function generateWithGemini(apiKey, body) {
    let lastError = null

    for (const model of GEMINI_MODELS) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            },
        )

        const data = await response.json().catch(() => ({}))

        if (response.ok) {
            return { ok: true, data, model }
        }

        lastError = data.error?.message || `Gemini HTTP ${response.status}`
        const retryable =
            response.status === 503 ||
            response.status === 429 ||
            response.status === 404

        if (!retryable) {
            return { ok: false, message: lastError }
        }
    }

    return {
        ok: false,
        message:
            lastError ||
            'All configured Gemini models are unavailable. Try again in a few minutes.',
    }
}

function findMentionedProducts(products, ...texts) {
    const combined = texts.filter(Boolean).join(' ').toLowerCase()

    return products
        .filter((p) => combined.includes(p.title.toLowerCase()))
        .sort((a, b) => b.title.length - a.title.length)
        .map((p) => ({
            _id: p._id,
            title: p.title,
            brand: p.brand,
            sellingPrice: p.sellingPrice,
            mrpPrice: p.mrpPrice,
            stockQuantity: p.stockQuantity,
            images: p.images,
        }))
}

exports.chat = async (req, res) => {
    try{
        const { message } = req.body

        if(!message){
            return res.status(400).json({ success: false, message: "Message is required!" })
        }

        const products = await Product.find({ isActive: true }, {
            title: 1,
            description: 1,
            sellingPrice: 1,
            mrpPrice: 1,
            brand: 1,
            stockQuantity: 1,
            images: 1
        })

        if(products.length < 1){
            return res.status(404).json({ success: false, message: "No active products found!" })
        }

        const productList = products.map((p) => `- ${p.title} (${p.brand}): ₹${p.sellingPrice}, stock: ${p.stockQuantity}. ${p.description}`).join('\n')

        const apiKey = process.env.GEMINI_API_KEY
        if(!apiKey){
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY is not set in env."})
        }

        const systemPrompt = `
        You are a helpful shopping assistant for LuxeMart store. You are given a user message and a list of products.
        Your task is to help users find products, compare prices and answer questions asked related to products.
        Product List:
        ${productList || 'No products available'}

        Rules - 
        - Use plain text only. Do NOT use markdown, asterisks, or bullet symbols.
        - Use line breaks to seperate points.
        - When mentioning a product, use its exact title from the list above.
        - Keep the answers short, helpful and easy to understand.
        - If the user's question is not related to the products, say "I'm sorry, I can only help with products related questions."
        - If the user's question is not clear, ask for more information.
        `

        const gemini = await generateWithGemini(apiKey, {
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: message.trim() }],
                },
            ],
        })

        if (!gemini.ok) {
            return res.status(502).json({
                success: false,
                message: gemini.message || 'Failed to get response from Gemini API',
            })
        }

        const data = gemini.data
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!reply) {
            const blockReason = data.promptFeedback?.blockReason
            const detail = blockReason
                ? `Response blocked: ${blockReason}`
                : 'Gemini returned an empty reply.'
            return res.status(502).json({ success: false, message: detail })
        }

        const mentionedProducts = findMentionedProducts(products, reply, message)

        return res.json({ success: true, message: "AI Assistant Response", response: reply, products: mentionedProducts })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}