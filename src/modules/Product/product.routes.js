import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controller from  './product.controller.js'
import { Brands } from "../../../DB/models/index.js";
// import { getDocumentByName } from "../../middleware/finders.middleware.js";
import { extensions } from "../../utils/index.js";
import { multerHost } from "../../middleware/multer.meddleware.js";
import { checkIfExist } from "../../middleware/finders.middleware.js";
const productRouter=Router()
productRouter.post('/create',multerHost({allowedExtensions:extensions.Images}).array('image',5),checkIfExist(Brands),errorHandler(controller.addProduct))
productRouter.put('/update/:productId',multerHost({allowedExtensions:extensions.Images}).array('image',5),errorHandler(controller.updateProduct))
productRouter.get('/list',errorHandler(controller.listProduct))



export {productRouter}