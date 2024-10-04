
import mongoose from "mongoose";
import { Router } from "express";
import * as controlller from './user.conroller.js'
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import { auth } from "../../middleware/authentication.js";

const userRouter=Router()

userRouter.post('/signUp',errorHandler(controlller.signUp))
userRouter.post('/signIn',errorHandler(controlller.signIn))
userRouter.put('/update/:userId',errorHandler(controlller.updateAccount))




export {userRouter}