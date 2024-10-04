import slugify from "slugify"
import { Brands, Category, SubCategory } from "../../../DB/models/index.js"
import { nanoid } from "nanoid"
import { cloudinaryConfig, uploadFile } from "../../utils/cluodnary.utils.js"


/**
 * @api {post} /create create brand
 */
export const createBrand = async (req, res, next) => {
    // destructing from req.query
    const {categoryId,subCategoryId}=req.query
      
        // check category id
    const isSubCategory=await SubCategory.findById({_id:subCategoryId,categoryId:categoryId}).populate('categoryId')
    if(!isSubCategory){
        return res.status(404).json({
            status:"fail",
            message:"subcategory not found"    
        })
    }

    // destructing from req.body
    const { name } = req.body
    //Generating brand slug
    const slug = slugify(name, { replacement: '_', lower: true })
    // images
    if (!req.file) {
        return next(new ErrorClass('image is required', 400, 'image is required'))
    }
    // upload image to clooudinary
    const customId = nanoid(4)
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${isSubCategory.categoryId.customId}/sub-categories/${isSubCategory.customId}/brands/${customId}`
    })
    // prepare brand object
    const brandObj = {
        name,
        slug,
        logo: {
            public_id,
            secure_url
        },
        customId,
        categoryId: isSubCategory.categoryId._id,
        subCategoryId: isSubCategory._id
    }
    // create brand in database
    const brand = await Brands.create(brandObj)
    res.status(201).json({
        status: 'success',
        message: 'created brand succeed',
        data: brand
    })
}
/**
 * @api {get} /:id get brand
 */
export const getBrand=async(req,res,next)=>{
    const {id,name,slug}=req.query

    const queryFilters={}
    if(name) queryFilters.name=name
    if(id) queryFilters._id=id
    if(slug)queryFilters.slug=slug
    const brand=await Brands.findOne(queryFilters)
    if(!brand){
        return res.status(404).json({
            status:"fail",
            message:"brand not found"    
        })
    }
    res.status(200).json({
        status:"success",
        data:brand
    })
}
/**
 * @api {put} /update update brand
 */
export const updateBrand=async(req,res,next)=>{
    const {_id}=req.params   
    const brand=await Brands.findById(_id).populate('categoryId').populate('subCategoryId')
    // console.log({brand});   
    if(!brand){
        return res.status(404).json({
            status:"fail",
            message:"brand not found"    
        })
    }
    // update brand name or slug
    const {name}=req.body
    if(name){
     const slug=slugify(name,{replacement:'_',lower:true})
     brand.name=name
     brand.slug=slug     
    }
    // update brand image
    if(req.file){
        const customId=brand.customId
        const splitBrandId=brand.logo.public_id.split(`${customId}/`)[1]
        const {secure_url,public_id}=await uploadFile({
            file:req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${customId}`
        })
        brand.logo.public_id=splitBrandId
        brand.logo.secure_url=secure_url
    }  
    await brand.save()
    res.status(200).json({
        status:"success",
        message:"updated brand succeed",
        data:brand
    })

}
/**
 * @api {delete} /delete delete brand
 */
export const deleteBrand=async(req,res,next)=>{
    const {_id}=req.params
    const brand=await Brands.findByIdAndDelete(_id).populate('categoryId').populate('subCategoryId')
    if(!brand){
        return res.status(404).json({
            status:"fail",
            message:"brand not found"    
        })
    }
    // delete brand image
    const brandPath=`${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${brand.customId}`
    // delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath)
    // delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(brandPath)
    
    //TODO related products

    res.status(200).json({
        status:"success",
        message:"deleted brand succeed",
        data:brand
    })
}
