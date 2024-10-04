
import mongoose from "mongoose";
import { Schema,model } from "mongoose";
import { PaymentMethodss,OrderStatus } from "../../src/utils/index.js";
import { Coupon } from "./coupon.model.js";
import { Product } from "./product.model.js";

const orderSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1,
                min:1
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    fromCart:{
        type:Boolean,
        default:true
    },
    address:String,
    addressId:{
        type:Schema.Types.ObjectId,
        ref:"Address"
    },
    contactNumber:{
        type:String,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    shippingFee:{
        type:Number,
        required:true
    },
    VAT:{
        type:Number,
        required:true
    },
    couponId:{
        type:Schema.Types.ObjectId,
        ref:"Coupon"
    },

    total:{
        type:Number,
        required:true
    },
    estimatedDelivaryDate:{
        type:Date,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true,
        enum:Object.values(PaymentMethodss)
    },
    orderStatus:{
        type:String,
        required:true,
        enum:Object.values(OrderStatus),  
    },
    deliverdBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    cancelledBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    deliverdAt:Date,
    cancelledAt:Date,
    payment_intent:String,

},{timestamps:true})


orderSchema.post("save",async function(){
    //decrement stock of product
    for (const productt of this.products) {
        await Product.updateOne({_id:productt.productId},{$inc:{stock:-productt.quantity}})   
    }
    // increment usage count of coupon
    if(this.couponId){
    const coupon=  await Coupon.findById(this.couponId)
    coupon.users.find(u=>u.userId.toString()===this.userId.toString()).usageCount++;
    await coupon.save()
    }
})

export const Order=mongoose.models.Order||model("Order",orderSchema)