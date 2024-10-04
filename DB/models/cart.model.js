

import mongoose from "mongoose";
import { Schema,model } from "mongoose";
import { calculateCartTotal } from "../../src/modules/cart/utils/cart.utils.js";
// import { calculateCartTotal } from "../../src/modules/Carts/Utils/cart.utils.js";


const cartSchema = new Schema({
    userId:{type:Schema.Types.ObjectId,
    ref:"User",
    required:true},
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:"Product",
                // required:true
            },
            quantity:{
                type:Number,
                // required:true,
                default:1,
                min:1},
            price:{
                type:Number,
                // required:true
            }
        }
    ],
    subTotal:Number
},{ timestamps:true})
cartSchema.pre('save',function(next){
    this.subTotal=calculateCartTotal(this.products)
    console.log('calculated befor save',this.subTotal);
    
    next()
})
cartSchema.post('save',async function (doc,next){
    if(doc.products.length == 0){
        console.log('delete cart after save id:',doc.userId);  
        await doc.deleteOne({userId:doc.userId})
       
    }
})
export const Cart=mongoose.models.Cart||model("Cart",cartSchema)