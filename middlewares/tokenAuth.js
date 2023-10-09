const jwt = require("jsonwebtoken")
const CustomError = require("./custom-error")

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization")
    if (!authHeader) {
        throw new CustomError("Not Authenticated", 401)
    }

    const token = authHeader.split(" ")[1]
    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        err.statusCode = 500
        throw error
    }

    if (!decodedToken) {
        throw new CustomError("Not Authenticated", 401)
    }

    req.userId = decodedToken.userId;
    next()
}