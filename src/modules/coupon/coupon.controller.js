import { Coupon, couponChangeLog } from "../../../DB/models/index.js"
import { User } from "../../../DB/models/index.js"

/**
 * @api{post}/create create coupon
 */
export const createCoupon=async(req,res,next)=>{
    const {CouponCode,CouponAmount,CouponType,from,till,users}=req.body
    console.log(req.body);
    
    // check coupon code exist
    const isCouponCodeExist=await Coupon.findOne({CouponCode})
    if(isCouponCodeExist){
        return res.status(400).json({message:"coupon code already exist"})
    }
    // $in operator
    const userIds= users.map(u=>u.userId)//[userId1,userId2]
    const validUsers=await User.find({_id:{$in:userIds}})
    if(validUsers.length !== userIds.length){
        return res.status(400).json({message:"invalid user"})
    }
    const newCoupon=new Coupon({
        CouponCode,CouponAmount,CouponType,till,from,users, createdBy:req.user._id
    })
    await newCoupon.save()
    res.status(201).json({message:"created coupon success",newCoupon})

}
/**
 * @api{get}/all get all coupon
 */
export const getAllCoupon=async(req,res,next)=>{
    const {isEnable}=req.query // 'true' or 'false'
    const query={}
    if(isEnable){
        query.isEnable =isEnable === 'true' ?true : false
    }
    const coupons=await Coupon.find(query)
    res.status(200).json({message:"success",coupons})
}
/**
 * @api{get}/coupon/couponId get coupon by id
 */
export const getCouponById=async(req,res,next)=>{
    const {couponId}=req.params
    const coupon=await Coupon.findById(couponId)
    if(!coupon){
        return res.status(404).json({message:"coupon not found"})
    }
    res.status(200).json({message:"success",coupon})
}
/**
 * @api{put}/update/:couponId update coupon
 */
export const updateCoupon=async(req,res,next)=>{
    const {couponId}=req.params
    const userId=req.user._id
    const {CouponCode,CouponAmount,CouponType,from,till,users}=req.body
    const coupon=await Coupon.findById(couponId)
    if(!coupon){
        return res.status(404).json({message:"coupon not found"})
    }
    const logUpdatedObject={couponId,updatedBy:userId,changes:{}}
    // couponCode update then check if couponCoude already exist in database
    if(CouponCode){
        const couponCoudExist=await Coupon.findOne({CouponCode})
        if(couponCoudExist){
            return res.status(400).json({message:"coupon code already exist"})
        }
        coupon.CouponCode=CouponCode
        logUpdatedObject.changes.CouponCode=CouponCode

    }
    if(from){
        coupon.from=from
        logUpdatedObject.changes.from=from
    }
    if(till){
        coupon.till=till
        logUpdatedObject.changes.till=till
    }
    if(CouponAmount){
        coupon.CouponAmount=CouponAmount
        logUpdatedObject.changes.CouponAmount=CouponAmount
    }
    if(CouponType){
        coupon.CouponType=CouponType
        logUpdatedObject.changes.CouponType=CouponType
    }
    if(users){
         // $in operator
    const userIds= users.map(u=>u.userId)//[userId1,userId2]
    const validUsers=await User.find({_id:{$in:userIds}})
    if(validUsers.length !== userIds.length){
        return res.status(400).json({message:"invalid user"})
    }
    coupon.users=users
    logUpdatedObject.changes.users=users
    }
    await coupon.save()
    const log= await new couponChangeLog(logUpdatedObject).save()
    res.status(200).json({message:"coupon updated",coupon,log})


}
/**
 * @api{patch} /coupons/apply/apply coupon
 */
export const disableEnableCoupon=async(req,res,next)=>{
    const {couponId}=req.params
    const userId=req.user._id
    const {enable}=req.body
    const coupon=await Coupon.findById(couponId)
    if(!coupon){
        return res.status(404).json({message:"coupon not found"})
    }
    const logUpdatedObject={couponId,updatedBy:userId,changes:{}}
    if(enable === true){
        coupon.isEnable=true
        logUpdatedObject.changes.isEnable=true
    }
    if(enable === false){
        coupon.isEnable=false
        logUpdatedObject.changes.isEnable=false
    }
    await coupon.save()
    const log= await new couponChangeLog(logUpdatedObject).save()
    res.status(200).json({message:"coupon updated",coupon,log})
}