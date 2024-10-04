import slugify from "slugify"
import { Brands, Product } from "../../../DB/models/index.js"
import { calculateProductPrice, ErrorClass, ReviewStatus, uploadFile } from "../../utils/index.js"
import { DiscountType } from "../../utils/index.js"
import { nanoid } from "nanoid"
import { ApiFeatures } from "../../utils/api-features.utils.js"

/**
 * @api {post} /create create product
 */
export const addProduct = async (req, res, next) => {
    // destructing from req.body
    const{title,price,overview,specs,stock,discountAmount,discountType}=req.body
    // destructing  ids from req.query
    // images
    if(!req.files.length){
        return next(new ErrorClass('No image uploaded',400,'No image uploaded'))
    }
    // ids check 
    const brandDocument=req.document

    // specs
    console.log({specs});
    // price
    // if not found discount then
    let appliedPrice=price
    // if found discount then
    if(discountAmount && discountType){
        if(discountType===DiscountType.PERCENTAGE){
            appliedPrice=price-((discountAmount*price)/100)
    }else if(discountType===DiscountType.FIXED){
        appliedPrice=price-discountAmount
    }   
}

// images section
const brandCustomId=brandDocument.customId
const categoryCustomId=brandDocument.categoryId.customId
const subCategoryCustomId=brandDocument.subCategoryId.customId
const customId=nanoid(4)
// const folder= `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/sub-categories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`
const folder = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;

const URLs=[]
for (const file of req.files) {
    // upload each file to cloudinary
    const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder:folder
    })
    // console.log({secure_url,public_id});
    
URLs.push({secure_url,public_id}) 
console.log(URLs);
   
}
// prepare product object
const productObject = {
    title,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    appliedPrice,
    stock,
    image: {
      URLs,
      customId,
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
  };
// create product in database
const product=await Product.create(productObject)
res.status(201).json({message:"added product success",product})
}
/**
 * @api {put} /update update product
 */
export const updateProduct = async (req, res, next) => {
    // productId from params
    const { productId } = req.params;
    // destructuring the request body
    const {
      title,
      stock,
      overview,
      badge,
      price,
      discountAmount,
      discountType,
      specs,
    } = req.body;
    // check if the product is exist
    const product = await Product.findById(productId);
    if (!product) return next(new ErrorClass("Product not found", { status: 404 }));
    console.log( product.title ,title);
    
    // check if the product belongs to the user
    // update the product title and slug
    if (title) {
      product.title = title;
      product.slug = slugify(title, {
        replacement: "_",
        lower: true,
      });
    }
    // update the product stock, overview, badge
    if (stock) product.stock = stock;
    if (overview) product.overview = overview;
    if (badge) product.badge = badge;
  
    // update the product price and discount
    if (price || discountAmount || discountType) {
      const newPrice = price || product.price;
      const discount = {};
      discount.amount = discountAmount || product.applyDiscount.amount;
      discount.type = discountType || product.applyDiscount.type;
  
      product.appliedPrice = calculateProductPrice(newPrice, discount);
  
      product.price = newPrice;
      product.applyDiscount = discount;
    }
  
    // update the product specs
    if (specs) product.specs = specs;
    /**
     * @todo when updating the Images field , you need to apply JSON.parse() method for specs before updating it in db
     */
  
    // save the product changes
    await product.save(); 
    // send the response
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: product,
    });
  };
  /**
   * @api {get} /get get product
   */
  export const listProduct = async (req, res, next) => {
    // pagination logic with use plugin or not
    // const {page=1,limit=10,...filters}=req.query
    // const skip=(page-1)*limit
    // // const produucts=await Product.find().limit(limit).skip(skip)
    // console.log({filters});
    // const filterStriing=JSON.stringify(filters)
    // const replaceFilter= filterStriing.replaceAll(/lt|lte|gt|gte|eq|ne|rejex/g,(ele)=> `$${ele}`)
    // const parsedFilter=JSON.parse(replaceFilter)
    //     console.log({filterStriing,replaceFilter,parsedFilter});

    const mongooseQuery=Product.find()
    const apiFeaturesInstance=new ApiFeatures(mongooseQuery,req.query).pagination().sort().filter()
    const products=await apiFeaturesInstance.mongooseQuery.populate([
      {path:"Reviews",match:{reviewStatus:ReviewStatus.Accepted}},
      // {path:"productId",select:"title rating -_id"}
  ])
    res.status(200).json({message:"success",products})
  }
  // page  1   2    3   4
  // limit 50  50   50  50
  // skip  0   50   100 150 ....(page-1)*limit=skip