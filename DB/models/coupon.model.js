
import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { CouponTypes } from "../../src/utils/index.js";
const couponSchema=new Schema({
    CouponCode:{
        type:String,
        required:true,
        unique:true
    },
    CouponAmount:{
        type:Number,
        required:true
    },
    CouponType:{
        type:String,
        required:true,
        enum:Object.values(CouponTypes)
    },
    from:{
        type:Date,
        required:true
    },
    till:{
        type:Date,
        required:true
    },
    users:[
        {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
    maxCount:{
        type:Number,
        min:1,
        required:true
    },
    usageCount:{
        type:Number,
        default:0
    }
        }   
    ],
    isEnable:{
        type:Boolean,
        default:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
    
},{timestamps:true})

export const Coupon=mongoose.models.Coupon||model("Coupon",couponSchema)
// create coupon change log model
// couponId , updatedBy ,changes:{}

const CouponChangeLogSchema=new Schema({
    couponId:{
        type:Schema.Types.ObjectId,
        ref:"Coupon",
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    changes:{
        type:Object
    }
},{timestamps:true})
export const couponChangeLog=mongoose.models.couponChangeLog||model("couponChangeLog",CouponChangeLogSchema)