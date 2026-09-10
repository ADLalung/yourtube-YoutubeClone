import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import userroutes from './routes/auth.js'
import videoroutes from './routes/video.js'
import path from "path"

import likeroutes from './routes/like.js'
import watchlaterroutes from './routes/watchlater.js'
import historyroutes from './routes/history.js'
import commentroutes from './routes/comment.js'

dotenv.config()
const app=express()

app.use(cors())
app.use(express.json({ limit:"30mb", extended:true }))
app.use(express.urlencoded({ limit:"30mb", extended:true }))
app.use("/uploads", express.static(path.join("uploads")))

app.get("/",(req,res)=>{
    res.send("Your tube backend is working")
})

app.use(bodyParser.json())
app.use("/user", userroutes)
app.use("/video", videoroutes)
app.use("/like", likeroutes)
app.use("/watch", watchlaterroutes)
app.use("/history", historyroutes)
app.use("/comment", commentroutes)

const PORT = process.env.PORT || 5000
const DBURL = process.env.DB_URL

console.log("Attempting to connect to MongoDB:", DBURL ? "✓ DB_URL found" : "✗ DB_URL missing")

mongoose.connect(DBURL, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    connectTimeoutMS: 5000
}).then(()=>{
    console.log("✓ MongoDB connected successfully")
    app.listen(PORT, ()=>{console.log(`✓ Server running on port ${PORT}`)})
}).catch((error)=>{
    console.error("✗ MongoDB connection error:", error.message)
    console.error("Full error:", error)
    process.exit(1)
})
