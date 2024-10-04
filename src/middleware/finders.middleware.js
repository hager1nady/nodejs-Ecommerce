
import { ErrorClass } from "../utils/error-class.utils.js";

export const getDocumentByName = (model) => {
  return async (req, res, next) => {
    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });
      if (document) {
        return res.status(400).json({message:"this category with this name already exists"})
      }
    }
    next();
  };
};




export const checkIfExist=(model)=>{
  return async(req,res,next)=>{
       // ids check 
       const{categoryId,subCategoryId,brandId}=req.query
       const document=await model.findOne({_id:brandId,categoryId:categoryId,subCategoryId:subCategoryId}).populate
       ([{path:"categoryId",select:"customId"},{path:"subCategoryId",select:"customId"}])
       
       if(!document){
           return res.status(404).json(`${model.modelName} is not found`)    
       }
  req.document=document
  next()

  }
}