import { Router } from "express";
import { extensions } from "../../utils/index.js";
import { multerHost } from "../../middleware/multer.meddleware.js";
import { getDocumentByName } from "../../middleware/finders.middleware.js";
import { Brands} from "../../../DB/models/index.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import  * as controller from  './brand.controller.js'
const brandRouter=Router()

brandRouter.post('/create',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(Brands),errorHandler(controller.createBrand))
brandRouter.get('/',errorHandler(controller.getBrand))
brandRouter.put('/update/:_id',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(Brands),errorHandler(controller.updateBrand))
brandRouter.delete('/delete/:_id',errorHandler(controller.deleteBrand))





export {brandRouter}