
import mongoose from "mongoose";
import { Router } from "express";
import { auth } from "../../middleware/authentication.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controller from './cart.controller.js'
const cartRouter=Router()
cartRouter.post('/add/:productId',auth(),errorHandler(controller.addToCart))
cartRouter.put('/remove/:productId',auth(),errorHandler(controller.removeCart))
cartRouter.put('/update/:productId',auth(),errorHandler(controller.updateCart))
cartRouter.get('/list',auth(),errorHandler(controller.listCart))





export {cartRouter}