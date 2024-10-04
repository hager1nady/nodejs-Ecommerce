import { Product } from "../../../DB/models/index.js"
import { Cart } from "../../../DB/models/index.js"
import { checkProductStock } from "./utils/cart.utils.js"

/**
 * @api{post} /add add to cart
 */
export const addToCart=async(req,res,next)=>{
    const userId=req.user._id
    const {quantity}=req.body
    const {productId}=req.params
    const product=await checkProductStock(productId,quantity)   
    if(!product){
        return res.status(404).json({message:"product not available"})
    }
    const cart=await Cart.findOne({userId})
    // in case cart not crreated    
    if(!cart){
        // const subTotal=product.appliedPrice*quantity
         const newCart=new Cart({
            userId,
            products:[{productId:product._id,quantity,price:product.appliedPrice}],
            // subTotal

         }) 
         await newCart.save()
         res.status(201).json({message:"added success cart",cart:newCart})
    }
    // in case cart already created
    // check iif product already exist in cart
   const productExist=await cart.products.find(p=>p.productId==productId)
   // if product is exist in cart
   if(productExist){
    return res.status(400).json({message:"product already exist in cart"})
   }
   // if product not exist in cart
   console.log(product.appliedPrice);
   cart.products.push({productId:product._id,quantity,price:product.appliedPrice})
   await cart.save()
   res.status(201).json({message:"added success",cart})
}
/**
 * @api{delete} /remove remove from cart
 */
export const removeCart=async(req,res,next)=>{
    const userId=req.user._id
    const {productId}=req.params
    const cart=await Cart.findOne({userId,'products.productId':productId})
    if(!cart){
        return res.status(404).json({message:"product not found in cart"})
    }
    cart.products=cart.products.filter(p=>p.productId != productId)
    await cart.save()
    res.status(200).json({message:"deleted success",cart})
}
/**
 * @api{put}/update update quantitiy and subTotal
 */
export const updateCart=async(req,res,next)=>{
    const userId=req.user._id
    const {productId}=req.params
    const {quantity}=req.body
    const cart=await Cart.findOne({userId,'products.productId':productId})
    if(!cart){
        return res.status(404).json({message:"product not found in cart"})
    }
    const product=await checkProductStock(productId,quantity)   
    if(!product){
        return res.status(404).json({message:"product not available"})
    }
    const productIndex=cart.products.findIndex(p=>p.productId.toString()== product._id.toString())
    console.log({productIndex});
    cart.products[productIndex].quantity=quantity
    await cart.save()
    res.status(200).json({message:"updated success",cart}) 
    

}
/**
 * @api{get}/list list cart
 */
export const listCart=async(req,res,next)=>{
    const userId=req.user._id
    const carts=await Cart.find({userId})
    res.status(200).json({message:"list carts success",carts})
}