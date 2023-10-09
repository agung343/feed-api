const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI

const connectDB = async() => {
    try {
        mongoose.set("strictQuery", false)
        const connect = await mongoose.connect(MONGODB_URI)
        console.log(`database connected ${connect.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB;