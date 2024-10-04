
import mongoose from "mongoose";
import { Router } from "express";
import { auth } from "../../middleware/authentication.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controller from './order.controller.js'
const orderRouter=Router()
orderRouter.post('/create',auth(),errorHandler(controller.createOrder))
orderRouter.put('/canceled/:orderId',auth(),errorHandler(controller.cancelOrder))
orderRouter.put('/delivered/:orderId',auth(),errorHandler(controller.deliverdOrder))
orderRouter.get('/list',auth(),errorHandler(controller.listOrders))
orderRouter.post('/stripePay/:orderId',auth(),errorHandler(controller.paymentWithStripe))
orderRouter.post('/webHook',errorHandler(controller.stripeWebHookLocal))
orderRouter.post('/refund/:orderId',auth(),errorHandler(controller.refundPaymentMethod))




export {orderRouter}