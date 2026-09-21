import express from 'express'
import { getSubscriptionTier, processDownload } from '../controllers/download.js'
import upload from '../filehelper/filehelper.js'

const routes = express.Router()

routes.get("/getall", getSubscriptionTier)
routes.post("/upload", upload.single("file"), processDownload)

export default routes;
