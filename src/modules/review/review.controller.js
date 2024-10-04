import { Order, Product, Review } from "../../../DB/models/index.js"
import { OrderStatus, ReviewStatus } from "../../utils/enums.utils.js"

/**
 * @api{post}/add add review
 */
export const addReview=async(req,res,next)=>{
    const {productId,rate,body}=req.body
    const userId=req.user._id
    // check if users already add review
    const ifIsAlreadyReviwed=await Review.findOne({userId,productId})
    if(ifIsAlreadyReviwed){
        return res.status(400).json({message:"you already reviewd of this product"})
    }
    // check if product exist
    const product=await Product.findById(productId)
    if(!product){
        return res.status(400).json({message:"product not found"})
    }
    // check if the user bought this product
    const isBoughtProduct=await Order.findOne({userId,"products.productId":productId,orderStatus:OrderStatus.DELIVERED})
    if(!isBoughtProduct){
        return res.status(400).json({message:"you must buy this product first"})
    }

    const reviewObg={
        userId,
        productId:productId,
        reviesRating:rate,
        reviewBody:body,
        

    }
    const newReview=await Review.create(reviewObg)
    return res.status(201).json({message:"created review success"})

}
/**
 * @api{get}/listAllRev  listallreviews 
 */
export const listReviewsAll=async(req,res,next)=>{
    const reviews=await Review.find().populate([
        {path:"userId",select:"username email -_id"},
        {path:"productId",select:"title rating -_id"}
    ])
    res.status(200).json({message:"success",reviews})
}
/**
 * @api{get}/acceptOrRejectRev
 */
export const acceptOrRejectRev=async(req,res,next)=>{
    const{reviewId}=req.params
    const{accept,reject}=req.body
    if(accept&&reject){
        return res.status(400).json({message:"please select accept or reject review"})
    }
    const review=await Review.findByIdAndUpdate(reviewId,{
        reviewStatus:accept
        ?ReviewStatus.Accepted:reject 
        ? ReviewStatus.Rejected 
        :ReviewStatus.Pending
    },{new:true})

    res.status(200).json({message:"Reviewd Approved",review})
}