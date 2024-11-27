import { Router } from "express"
import { signin, signup } from "../actions"


const router = Router()
router.get("/health",(req,res)=>{
    res.send("API Server is running")
})
router.post("/signup",signup)
router.post("/signin",signin)



export default router;