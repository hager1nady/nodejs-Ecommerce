import { Router } from "express";
import  * as controller  from './sub-category.controller.js'
import { SubCategory } from "../../../DB/models/index.js";
import { multerHost } from "../../middleware/multer.meddleware.js";
import { extensions } from "../../utils/file-extentions-utils.js";
import { getDocumentByName } from "../../middleware/finders.middleware.js";
import { errorHandler } from "../../middleware/error-handling.middleware.js";

const subCategoryRouter=Router()

subCategoryRouter.post('/create',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(SubCategory),errorHandler(controller.createSubCategory))
subCategoryRouter.get('/:id',errorHandler(controller.getSubCategory))
subCategoryRouter.put('/update/:id',multerHost({allowedExtensions:extensions.Images}).single('image'),getDocumentByName(SubCategory),errorHandler(controller.updateSubCategory))
subCategoryRouter.delete('/delete/:_id',errorHandler(controller.deleteSubCategory))





export {subCategoryRouter}