
import mongoose from "../global-setUp.js";
import { Schema,model } from "mongoose";
import slugify from "slugify";

// utils
import { Badges,  DiscountType } from "../../src/utils/index.js";
const productSchema=new Schema({
    // strings section
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        lowercase:true,
        default:function(){
         return slugify(this.title,{replacement:"_",lowercase:true})
            
        }
    },
    overview:String,
    specs:Object,// map validation
    badge:{
        type:String,
        enum:Object.values(Badges),
    },
    // Number section
    // price is original price
    price:{
        type:Number,
        required:true,
        min:50
    },
    // applyDiscount 
    applyDiscount:{
        // amount 
        amount:{
            type:Number,
            min:0,
            default:0
        },
        // % or fixed
        type:{
            type:String,
            enum:Object.values(DiscountType),
            default:DiscountType.PERCENTAGE
        }
    },
    // price after descount == now
    appliedPrice:{
        type:Number,
        required:true,
        default:function(){
           return calculateProductPrice(this.price,this.applyDiscount)
        }
        },
    stock:{
        type:Number,
        required:true,
        min:10
    },
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
// images section
    image:{
        URLs:[
            {
            secure_url:{
                type:String,
                required:true
            },
            public_id:{
                type:String,
                required:true,
                unique:true
            }
        }
    ],
        customId:{
            type:String,
            // required:true,
            unique:true
        }
    },
    //Ids section
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    subCategoryId:{
        type:Schema.Types.ObjectId,
        ref:"SubCategory",
        required:true
    },
    brandId:{
        type:Schema.Types.ObjectId,
        ref:"Brands",
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false // TODO: Change to true after adding authentication
    }
},
{timestamps:true,toJSON:{ virtuals: true },toObject:{virtuals: true }}
)

productSchema.virtual('Reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId',
    // justOne: true
  });
  
  
  
  


export const Product=mongoose.models.Product || model("Product",productSchema)