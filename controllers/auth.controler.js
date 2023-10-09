const {validationResult} = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const CustomError = require("../middlewares/custom-error")
const User = require("../models/user.model.js")


exports.signup = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
       const validMsg = errors.array().map(err => err.msg);
       throw new CustomError("Validation error", 422, validMsg)
    }
    const {email, password} = req.body

    try {
        const saltRound = Math.floor((Math.random() * 12) + (Math.random() * 10 + (Math.random() +5)))
        const hashPassword = await bcrypt.hash(password, saltRound)

        const newUser = new User({
            email: email,
            password: hashPassword
        })
        await newUser.save()
        
        res.status(201).json({
            message: "new user signed up"
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
exports.login = async (req, res, next) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email: email})
        if (!user) {
            throw new CustomError("email or password is incorrect, please try again")
        }
    
        const matchPassword =  bcrypt.compare(password, user.password)
        if(!matchPassword) {
            throw new CustomError("email or password is incorrect, please try again")
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        res.status(200).json({
            token: token,
            userId: user._id.toString()
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}