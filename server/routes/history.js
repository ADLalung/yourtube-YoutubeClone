import express from 'express'
import { handlehistory, handleview, getallHistory } from "../controllers/history.js"

const routes = express.Router()

routes.get("/:userId", getallHistory)
routes.post("/views/:videoId", handleview)
routes.post("/:videoId", handlehistory)

export default routes;
