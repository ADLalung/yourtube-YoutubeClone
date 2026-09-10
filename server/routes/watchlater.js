import express from 'express'
import { getallWatchlater, handlewatchlater } from "../controllers/watchlater.js"

const routes = express.Router()

routes.get("/:userId", getallWatchlater)
routes.post("/:videoId", handlewatchlater)

export default routes;
