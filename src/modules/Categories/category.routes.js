import { Router } from "express";
import { multerHost } from "../../middleware/multer.meddleware.js";
import { extensions } from "../../utils/index.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as controlller from './category.controller.js'
import { getDocumentByName } from "../../middleware/finders.middleware.js";
import { Category } from "../../../DB/models/category.model.js";
const categoryRouter=Router()
categoryRouter.post('/create',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(Category),errorHandler(controlller.createCategory))
categoryRouter.get('/',errorHandler(controlller.getAllCategory))
categoryRouter.put('/update/:_id',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(Category),errorHandler(controlller.updateCaregory))
categoryRouter.delete('/delete/:_id',errorHandler(controlller.deleteCategory))
categoryRouter.get('/list',errorHandler(controlller.listAllCategory))





export {categoryRouter}