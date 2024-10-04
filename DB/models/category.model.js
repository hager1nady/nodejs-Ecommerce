import mongoose from "../global-setUp.js";
import { type } from "os";
import { Product } from "./product.model.js";
import { SubCategory } from "./subcategory.model.js";
const {model,Schema}=mongoose;
const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", // To Do user model
        required:false// TO DO change true after addding authentication
    },
    images:
        {
            secure_url:
            {
                type:String,
                required:true
            },
                        
            public_id:
            {
                type:String,
                required:true,
                unique:true
            }
      },
      customId:{
        type:String,
        required:true,
        unique:true
      }
        
    
},{timestamps:true})
categorySchema.post('findByIdAndDelete',async function(doc,next){
    const _id=this.Category._id
      // todo delete relevent sub-category from db
      const deleteSubCategory=await SubCategory.deleteMany({categoryId:_id})
      // todo delete relevent brands from db
      if(deleteSubCategory.deletedCount){
        const deleteBrands=  await Brands.deleteMany({categoryId:_id})
          //TODO related products
          if(deleteBrands.deletedCount){
                await Product.deleteMany({categoryId:_id})
          }
      }
      next()
})

export const Category=mongoose.models.Category||model("Category",categorySchema)