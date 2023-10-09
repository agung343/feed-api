require("dotenv").config()
const express = require("express");
const path = require("path")
const bodyParser = require("body-parser")

const connectDB = require("./middlewares/connectDB")
const cors = require("./middlewares/cors")
const feedRoute = require("./routes/feed.route.js")
const authRoute = require("./routes/auth.route.js")

const errorHandler = require("./middlewares/errosHandler")

const PORT = process.env.PORT || 8080

connectDB()
const app = express()

app.use(bodyParser.json())
app.use("/images", express.static(path.join(__dirname, "images")))
app.use(cors)

app.use("/feed", feedRoute)
app.use("/auth", authRoute)

app.use(errorHandler)

app.listen(PORT, () => console.log(`Listening at ${PORT}`))
