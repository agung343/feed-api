const Router = require("express").Router
const {body} = require("express-validator")
const User = require("../models/user.model.js")

const authControler = require("../controllers/auth.controler.js")

const router = Router()

router.post(
    "/signup",
    [
        body("email").isEmail().withMessage("Please enter valid email").custom((value, {req}) => {
            return User.findOne({email: value}).then(userDoc => {
                if (userDoc) {
                    return Promise.reject("Email already exist")
                }
            })
        }).normalizeEmail(),
        body("password").trim().isLength({min: 4})
    ],
    authControler.signup
)

router.post(
    "/login",
    authControler.login
)

module.exports = router;