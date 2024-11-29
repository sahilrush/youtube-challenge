import { Router } from "express"
import { signin, signup } from "../actions"
import { channelRouter } from "./channel"
import { videoRouter } from "./video"


const router = Router()
router.get("/health",(req,res)=>{
    res.send("API Server is running")
})
router.post("/signup",signup)
router.post("/signin",signin)
router.use("/channels",channelRouter)
router.use("/videos",videoRouter)



export default router;