import Joi from "joi";
import mongoose from "mongoose";
const objectIdValidation=(value,helper)=>{
    const isValid=mongoose.isValidObjectId(value)
    if(!isValid){
        return helper.message("invalid object id")
    }
    return value 
}



export const generalRules={
    _id:Joi.custom(objectIdValidation)
}