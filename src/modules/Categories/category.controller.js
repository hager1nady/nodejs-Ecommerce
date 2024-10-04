

import slugify from "slugify"
import { cloudinaryConfig,ErrorClass} from "../../utils/index.js"
import { nanoid } from "nanoid"
import { Brands, Category, SubCategory } from "../../../DB/models/index.js"
import { ApiFeatures } from "../../utils/api-features.utils.js"

/**
 * @api {post} /category/create  cteate or add category
 */
export const createCategory=async(req,res,next)=>{
    // destructing from req.body
     const{name}=req.body
     //Generating category slug
     const slug=slugify(name,{replacement:'_',lower:true})
     // images
      if(!req.file){
        return next(new ErrorClass('image is required',400,'image is required'))
    }
    // upload image to clooudinary
    const customId=nanoid(4)
     const {secure_url,public_id}=await cloudinaryConfig().uploader.upload(req.file.path,{
        folder:`${process.env.UPLOADS_FOLDER}/categories/${customId}`
    });
    
    /// prepare category object
    const categoryObj={
        name,
        slug,
        images:{
            public_id,
           secure_url
        },
        customId
    }
    // create category in database
    const category=await Category.create(categoryObj)

    res.status(201).json({
        status:"success",
        message:"created category succeed",
        data:category

    })
} 
/**
 * @api { get} / getAllCategeory
 */
export const  getAllCategory=async(req,res,next)=>{
    const{id,name,slug}=req.query
    const queryFilters={}
    if(id) queryFilters._id=id
    if(name) queryFilters.name=name
    if(slug)queryFilters.slug=slug
    const categories=await  Category.findOne(queryFilters)
    if(!categories){
        return res.status(404).json({message:"categories not found"})
    }
    return res.status(200).json
    ({
        message:'get success',
        status:"success",
        data:categories
    })
}

/**
 * @api {put}/update update category
 */

export const updateCaregory=async(req,res,next)=>{
    const{_id}=req.params
    const category=await Category.findById({_id})
    if(!category){
        return res.status(404).json({message:"category not found"})
    }
    
    // update name of category
    const{name,public_id_new}=req.body
    if(name){
        const slug=slugify(name,{replacement:'_',lower:true})
        category.name=name
        category.slug=slug 
    }
    // update image of category
    if(req.file){
        const splitedPublicId=category.images.public_id_new.split(`${category.customId}/`)[1]
        console.log(splitedPublicId);
        
        const {secure_url}= await cloudinaryConfig().uploader.upload(req.file.path,{
            folder:`${process.env.UPLOADS_FOLDER}/categories/${category.customId}`,
            public_id:splitedPublicId
        })
        console.log({secure_url});
        
        category.images.secure_url=secure_url
    }

    await category.save()
    res.status(200).json({
        status:"success",   
        message:"update category succeed",
        data:category
    })
}
/**
 * @api  {delete}/delete delete category
 */
export const deleteCategory=async(req,res,next)=>{
    const{_id}=req.params
    const category=await Category.findByIdAndDelete({_id})
    if(!category){
        return next(
            new ErrorClass("Category not found", 404, "Category not found")
          );
    }
    // path of image on cloudinary
    const categoryPath=`${process.env.UPLOADS_FOLDER}/categories/${category.customId}`
    // delete image from cloudinary in folder with this path
    await  cloudinaryConfig().api.delete_resources_by_prefix(categoryPath)
    // delete this folder
    await  cloudinaryConfig().api.delete_folder(categoryPath)

    // // todo delete relevent sub-category from db
    // const deleteSubCategory=await SubCategory.deleteMany({categoryId:_id})
    // // todo delete relevent brands from db
    // if(deleteSubCategory.deletedCount){
    //     await Brands.deleteMany({categoryId:_id})
    //     //TODO related products
    // }
    res.status(200).json({
        status:"success",
        message:"delete category succeed",
        data:category
    })
}

/**
 * @api {get} getAllcategory with pagination oor sort or filtration
 */
export const listAllCategory = async(req,res,next)=>{
    const mongooseQuery=Category.find()
    const apiFeaturesInstance=new ApiFeatures(mongooseQuery,req.query).pagination().filter()
    const list=await apiFeaturesInstance.mongooseQuery
    res.status(200).json({
        status:"success",
        message:"list categories succeed",
        data:list
    })
    
}



