
import mongoose from "mongoose";
import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controller from './address.controller.js'
import { auth } from "../../middleware/authentication.js";
const addressRouter=Router()

addressRouter.post('/add',auth(),errorHandler(controller.addNewAddress))
addressRouter.put('/update/:addressId',auth(),errorHandler(controller.updateAddress))
addressRouter.put('/soft-delete/:addressId',auth(),errorHandler(controller.removeAddress))
addressRouter.get('/list-address',auth(),errorHandler(controller.listAddresses))


export {addressRouter}