const fs = require("fs")
const path = require("path")
const { validationResult } = require("express-validator")
const Post = require("../models/post.model.js")
const User = require("../models/user.model.js")
const CustomError = require("../middlewares/custom-error.js")

exports.getPosts = async (req,res,next) => {
    const currentPage = req.query.page || 1
    const perPage = 2; //show how many posts in one page
    let totalItems
    try {
        // paginate posts
        const count = await Post.find().countDocuments()
        totalItems = count

        const posts = await Post.find().skip((currentPage - 1) * perPage) 
        if (!posts) {
           throw new CustomError("Could not get any post", 500)
        }

        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (err) {
        if(err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.createPost = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new CustomError("Form Validation Failed", 422)
    }

    if (!req.file) {
        throw new CustomError("No image provided", 422)
    }

    const {title, content} = req.body
    const imageUrl = req.file.filename
    const userId = req.userId

    try {
        const newPost = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: userId
        })

        const post = await newPost.save()

        const user = await User.findById(userId)
        if (user) {
            user.posts.push(post._id)
            await user.save()
        }

        res.status(201).json({
            message: "created new post",
            post: post,
            creator: {
                _id: user._id
            }
        })
    } catch (err) {
        if(err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.getSinglePost = async(req, res, next) => {
    const {postId} = req.params

    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error("Could not find the post")
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            post: post
        })
    } catch (err) {
        if(err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.editPost = async(req, res, next) => {
    const {postId} = req.params
    const userId = req.userId;

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new CustomError("Form Validation Failed", 422)
    }

    const {title, content} = req.body
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.filename
    } else if (!imageUrl) {
        throw new CustomError("No image picked", 422)
    }
    try {
        const post = await Post.findById(postId)
        if (!post) {
           throw new CustomError("Could not the post", 404)
        }
        if (post.creator.toString() !== userId) {
            throw new CustomError("Access denied", 403)
        }
        
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl)
        }

        post.title = title;
        post.content = content
        post.imageUrl = imageUrl
        await post.save()

        res.status(200).json({
            message: "updated",
            post: post
        })
    } catch (error) {
        if(err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.deletePost = async(req, res, next) => {
    const {postId} = req.params
    const userId = req.userId
    try {
        const post = await Post.findById(postId)
        if (!post) {
            throw new CustomError("Could not the post", 404)
        } 
        if (post.creator.toString() !==  userId) {
            throw new CustomError("Access denied", 403)
        }
            
        const deleted = await Post.findByIdAndDelete(postId)
        clearImage(post.imageUrl)

        // clear relation
        const user = await User.updateOne({ _id: userId}, {
            $pull: {
                posts: deleted._id
            }
        })
        
        res.status(200).json({
            message: "post has been delete"
        })
    } catch (err) {
        if(err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}


function clearImage (filePath) {
    filePath = path.join(__dirname, "__", filePath)
    fs.unlink(filePath, err => console.log(err))
}