import express from "express"
import { getCurrentUser } from "../controllers/user.controllers.js"

const userRouter=express.Router()

userRouter.post("/current",getCurrentUser)




export default userRouter