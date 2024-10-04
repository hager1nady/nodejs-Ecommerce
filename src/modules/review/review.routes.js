
import mongoose from "mongoose";
import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controller from './review.controller.js'
import { auth } from "../../middleware/authentication.js";
const reviewRouter=Router();

reviewRouter.post('/createRev',auth(),errorHandler(controller.addReview))
reviewRouter.get('/listAllRev',auth(),errorHandler(controller.listReviewsAll))
reviewRouter.put('/accept-reject/:reviewId',auth(),errorHandler(controller.acceptOrRejectRev))




export {reviewRouter}