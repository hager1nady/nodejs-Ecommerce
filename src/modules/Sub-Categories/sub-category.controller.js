import slugify from "slugify"
import { Brands, Category, SubCategory } from "../../../DB/models/index.js"
import { nanoid } from "nanoid"
import {  cloudinaryConfig, uploadFile } from "../../utils/cluodnary.utils.js"
import { ErrorClass } from "../../utils/error-class.utils.js"
/**
 * @api {post} /create create sub-category
 */
export const createSubCategory = async (req, res, next) => {
    // check category id
    const category=await Category.findById(req.query.categoryId)
    if(!category){
        return res.status(404).json({
            status:"fail",
            message:"category not found"    
        })
    }
     // destructing from req.body
     const{name}=req.body
     //Generating sub-category slug
     const slug=slugify(name,{replacement:'_',lower:true})
     // images
      if(!req.file){
        return next(new ErrorClass('image is required',400,'image is required'))
      
    }
    // upload image to clooudinary
    const customId=nanoid(4)
     const {secure_url,public_id}=await uploadFile({
        file:req.file.path,
        folder:`${process.env.UPLOADS_FOLDER}/categories/${category.customId}/sub-categories/${customId}`
    });
     // prepare category object
     const subcategoryObj={
        name,
        slug,
        images:{
            public_id,
           secure_url
        },
        customId,
        categoryId:category._id
    }
    // create category in database
    const subcategory=await SubCategory.create(subcategoryObj)
    res.status(201).json({
        status:"success",
        message:"created subcategory succeed",
        data:subcategory

    })
}
/**
 * @api {get} /get get sub-category
 */
export  const getSubCategory=async(req,res,next)=>{
    const {id,name,slug}=req.params
    const queryFilters={}
    if(id) queryFilters._id=id
    if(name) queryFilters.name=name
    if(slug)queryFilters.slug=slug
    const subcategory=await SubCategory.findById(queryFilters).populate("categoryId")
    if(!subcategory){
        return next(new ErrorClass("subcategory not found",404,"subcategory not found"))
    }
    res.status(200).json({
        status:"success",
        message:"get subcategory succeed",
        data:subcategory
    })
}
/**
 * @api {put} /update update sub-category
 */
export  const updateSubCategory=async(req,res,next)=>{
    const {id}=req.params
    const {name,public_id_new}=req.body

    const subcategory=await SubCategory.findById(id).populate("categoryId")
    if(!subcategory){
        return next(new ErrorClass("subcategory not found",404,"subcategory not found"))
    }

    // update name of subcategory
    if(name){
        const slug=slugify(name,{replacement:'_',lower:true})
        subcategory.name=name
        subcategory.slug=slug
    }
    //  update image of subcategory
      if(req.file){
        console.log(subcategory.images.public_id);
        
        const splitedPublicId=subcategory.images.public_id.split(`${subcategory.customId}/`)[1]
        console.log(splitedPublicId);
        
        const {secure_url}= await cloudinaryConfig().uploader.upload(req.file.path,{
            folder: `${process.env.UPLOADS_FOLDER}/categories/${subcategory.categoryId.customId}/sub-categories/${subcategory.customId}`,
            public_id:splitedPublicId
        })
        console.log({secure_url});
        
        subcategory .images.secure_url=secure_url
    }
    await subcategory.save()
    res.status(200).json({
        status:"success",
        message:"updated subcategory succeed",
        data:subcategory
    })
}
/**
 * @api {delete} /delete delete sub-category
 */

export const deleteSubCategory=async(req,res,next)=>{
    const {_id}=req.params
    const subcategory=await SubCategory.findByIdAndDelete({_id}).populate("categoryId")
    if(!subcategory){
        // return next(new ErrorClass("subcategory not found",404,"subcategory not found"))
        return res.status(404).json({
            status:"fail",
            message:"subcategory not found"
        })
    }
 
    const supcategoryPath=`${process.env.UPLOADS_FOLDER}/categories/${subcategory.categoryId.customId}/sub-categories/${subcategory.customId}`
    // delete image from cloudinary in folder with this path
    await  cloudinaryConfig().api.delete_resources_by_prefix(supcategoryPath)
    // delete this folder
    await cloudinaryConfig().api.delete_folder(supcategoryPath)

    // todo delete relevent brands from db
    await Brands.deleteMany({subCategoryId:subcategory._id})
    res.status(200).json({
        status:"success",
        message:"delete subcategory succeed",
        data:subcategory
    })
}