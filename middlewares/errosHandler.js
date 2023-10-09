const CustomError = require("./custom-error")

const errorHandler = (err, req, res, next) => {
    console.error(err)

    // handle instance of CustomError
    if (err instanceof CustomError) {
        const {statusCode, message, validMsg} = err
        return res.status(statusCode).json({
            message: message,
            validMsg: validMsg
        })
    }

    // handle others error
    const status = err.statusCode || 500
    const message = err.message || "Something is Error"
    res.status(status).json({
        message: message,
    })
    next(err)
}

module.exports = errorHandler