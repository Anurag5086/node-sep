const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        const bearerToken =
            authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : null
        const token = bearerToken || req.cookies?.token

        if(!token){
            return res.status(401).json({ success: false, message: "Access Denied! No token provided!" })
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedPayload

        next()
    }catch(err){
        res.status(401).json({ success: false, message: "Invalid or expired token!" })
    }
}

module.exports = authMiddleware