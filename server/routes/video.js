import express from 'express'
import { uploadvideo, getallvideo } from '../controllers/video.js'
import upload from '../filehelper/filehelper.js'

const routes = express.Router()

routes.get("/getall", getallvideo)
routes.post("/upload", upload.single("file"), uploadvideo)

export default routes;
