class CustomError extends Error {
    constructor(message, statusCode, validMsg) {
        super(message)
        this.statusCode = statusCode
        this.validMsg = validMsg
    }
}

module.exports = CustomError;