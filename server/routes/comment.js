import express from 'express'
import { 
    getallComment,
    postcomment,
    deletecomment,
    editcomment
} from "../controllers/comment.js"

const routes = express.Router()

routes.post("/postcomment", postcomment)
routes.post("/deletecomment/:id", deletecomment)
routes.put("/editcomment/:id", editcomment)
routes.get("/:videoId", getallComment)

export default routes;
