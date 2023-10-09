const path = require("path")
const Router = require("express").Router
const body = require("express-validator").body
const multer = require("multer")
const crypto = require("crypto")

const tokenAuth = require("../middlewares/tokenAuth")
const feedControler = require("../controllers/feed.controler.js")

const generaterRandomName = () => {
    const randomString = crypto.randomBytes(20).toString("hex")
    return randomString
}

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../images"))
    },
    filename: (req, file, cb) => {
        const randomString = generaterRandomName()
        cb(null, randomString + "-" + file.originalname)
    }
})

const upload = multer({storage: fileStorage, fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        callback(null, true)
    } else {
        callback(null, false)
    }
}})

const router = Router()

router.get(
    "/posts", 
    feedControler.getPosts
)

router.get(
    "/posts/:postId",
    feedControler.getSinglePost
)

router.post(
    "/new-post",
    tokenAuth,   
    upload.single("image"), 
    [
        body("title").trim().isLength({min: 5}),
        body("content").trim().isLength({min: 5})
    ],  
    feedControler.createPost
)

router.put(
    "/posts/:postId",
    tokenAuth,
    upload.single("image")
    [
        body("title").trim().isLength({min: 5}),
        body("content").trim().isLength({min: 5})
    ],  
    feedControler.editPost
)

router.delete(
    "/posts/:postId",
    tokenAuth,
    feedControler.deletePost
)

module.exports = router;