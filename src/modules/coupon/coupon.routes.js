
import mongoose from "mongoose";
import { Router } from "express";
import * as controller from './coupon.controller.js'
import { auth } from "../../middleware/authentication.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
const couponRouter=Router()

couponRouter.post('/create',auth(),validationMiddleware(createCouponSchema),errorHandler(controller.createCoupon))
couponRouter.get('/all',auth(),errorHandler(controller.getAllCoupon))
couponRouter.put('/details/:couponId',auth(),validationMiddleware(updateCouponSchema),errorHandler(controller.updateCoupon))
couponRouter.patch('/enable/:couponId',auth(),errorHandler(controller.disableEnableCoupon))



export {couponRouter}