import { isValidObjectId } from "mongoose"
import { Address, Cart, Order, Product } from "../../../DB/models/index.js"
import { OrderStatus, PaymentMethodss } from "../../utils/enums.utils.js"
import { calculateCartTotal } from "../cart/utils/cart.utils.js"
import { applyCoupon, validateCoupon } from "./utils/order.utils.js"
import { DateTime } from "luxon"
import { confirm, createCheckoutSession, createPaymentIntent, createStripeCoupon, refundPaymentData } from "../../payment-handler/stripe.js"

/**
 * @api{post} /create create order
 */
export const createOrder=async(req,res,next)=>{
    const userId=req.user._id
    const {address,addressId,contactNumber,shippingFee, VAT,paymentMethod,couponCode}=req.body
    // find logged in user cart with products بشوف اليوزر عنده بروداكت فالكارت ولا لا
    const cart=await Cart.findOne({userId}).populate('products.productId')
    if(!cart || !cart.products.length){
        return res.status(400).json({message:"Empty cart"})
    }
    // check if products is valid
    const isSolOut=cart.products.find((p)=>p.productId.stock < p.quantity)
    if(isSolOut){
        return res.status(400).json({message:`product${isSolOut.productId.title} is sold out`})
    }
    // calc subTotal
    const subTotal=calculateCartTotal(cart.products)
    let total=shippingFee+subTotal+VAT;
    let coupon=null
    if(couponCode){ 
        const isCouponValid=await validateCoupon(couponCode,userId,res)
        // return res.status(400).json({message:`coupon is not valid `,isCouponValid})
        if(isCouponValid.error){
        return res.status(400).json({message:`${isCouponValid.message}`})

        }
        coupon=isCouponValid.coupon
        total = applyCoupon(subTotal,isCouponValid.coupon)
    }
    // check address or addressId
    if(!address && !addressId){
        return res.status(400).json({message:"address or addressId"})
    }

    if(addressId){
        const addressInfo=await Address.findOne({_id:addressId,userId})
        if(!addressInfo){
            return res.status(400).json({message:"invalid addresses"})
        }
    }

    let orderStatus=OrderStatus.PENDING
    if(paymentMethod === PaymentMethodss.CASH){
        orderStatus==OrderStatus.PLACED
    }
    const orderObj=new Order({
        userId,
        products:cart.products,
        address,
        addressId,
        contactNumber,
        subTotal,
        shippingFee,
        VAT,
        couponId:coupon?._id,
        total,
        paymentMethod,
        orderStatus,
        estimatedDelivaryDate:DateTime.now().plus({days:7}).toFormat("yyyy-MM-dd")
    })
    await orderObj.save()
    // clear cart
    cart.products=[]
    await cart.save()
    // decrement the stock of products
    // increment the usageCount of coupon
    res.status(201).json({message:"order created success",order:orderObj})

}
/**
 * @api{put} /canceled cancel order
 */
export const cancelOrder=async(req,res,next)=>{
    const userId=req.user._id
    const {orderId}=req.params
    // check if order exist get order data
    const order=await Order.findOne({_id:orderId,userId,orderStatus:{$in:[OrderStatus.PENDING,OrderStatus.PLACED,OrderStatus.CONFIRMED]}})
    if(!order){
        return res.status(400).json({message:"order not found"})
    }
    // check if order bought befor 3 dayes
    const orderDate=DateTime.fromJSDate(order.createdAt)
    const currentDate=DateTime.now()
    const diff=Math.ceil(Number(currentDate.diff(orderDate,"days").toObject().days).toFixed(2))
    console.log({diff});
    console.log(currentDate.diff(orderDate,"days").toObject());
    if(diff>3){
        return res.status(400).json({message:"cannot cancelled order after 3 dayes"})
    }
    //update order satus cancelled
    order.orderStatus=OrderStatus.CANCELED
    order.cancelledAt=DateTime.now()
    order.cancelledBy=userId
    await Order.updateOne({_id:orderId},order)
    // update product model stock
    for (const product of order.products) {
        await Product.updateOne({_id:product.productId},{$inc:{stock:product.quantity}})
    }
    res.status(200).json({message:"order cancelled success",order})
}
/**
 * @api{put}/deliverd 
 */
export const deliverdOrder=async(req,res,next)=>{
    const userId=req.user._id
    const {orderId}=req.params
      // check if order exist get order data
      const order=await Order.findOne({_id:orderId,userId,orderStatus:{$in:[OrderStatus.PLACED,OrderStatus.CONFIRMED]}})
      if(!order){
          return res.status(400).json({message:"order not found"})
      }
      order.orderStatus=OrderStatus.DELIVERED
      order.deliverdAt=DateTime.now()
      await Order.updateOne({_id:orderId},order)
      res.status(200).json({message:"order delivered success",order})

}
/**
 * @api{get}/list list orders
 */
export const listOrders=async(req,res,next)=>{
    const userId=req.user._id

    const orders=await Order.find({userId})
    res.status(200).json({message:"list orders succes",orders})
}
/**
 * @api{}/payment
 */
export const paymentWithStripe=async(req,res,next)=>{
    const {orderId}=req.params
    const userId=req.user._id

    const order=await Order.findOne({
        userId,
        _id:orderId,
        orderStatus:"Pending"
    });
    if(!order){
        return res.status(404).json({message:"order not found"})
    }
    const paymentObj={
        customer_email:req.user.email,
        metadata:{orderId:order._id.toString()},
        discounts:[],
        line_items:order.products.map(product=>{
            return {
                price_data:{
                    currency:"egp",
                    product_data:{
                        name:req.user.username
                    },
                    unit_amount:product.price*100
                },
                quantity:product.quantity
            }
        })
    }
    if(order.couponId){
        const stripeCoupon=await createStripeCoupon({couponId:order.couponId})
        if(stripeCoupon.status){
            return res.status(400).json({message:stripeCoupon.message})
        }
        paymentObj.discounts.push({coupon:stripeCoupon.id})
    }

    const checkOutSession=await createCheckoutSession(paymentObj)
    const paymentIntent=await createPaymentIntent({
        amount:order.total,
        currency:"egp",

    })
    order.payment_intent=paymentIntent.id
    await order.save()
    return res.status(200).json({message:"payment initialized",checkOutSession,paymentIntent})
}

export const stripeWebHookLocal=async(req,res,next)=>{
    console.log(req.body);
    
    const orderId=req.body.data.object.metadata.orderId
    const confirmOrder=await Order.findByIdAndUpdate(orderId,{
        orderStatus:OrderStatus.CONFIRMED
    }) 
    const confirmPaymentIntent=await confirm({paymentIntentId:confirmOrder.payment_intent})   
    res.status(200).json({confirmPaymentIntent})
}
// refund payment data
export const refundPaymentMethod=async(req,res,next)=>{
    const {orderId}=req.params;
    const findOrder=await Order.findOne({
        _id:orderId,
        orderStatus:OrderStatus.CONFIRMED
    })
    if(!findOrder){
        return res.status(404).json({message:"order not found"})
    }
    const refund=await refundPaymentData({paymentIntentId:findOrder.payment_intent});
    if(refund.status){
        return res.status(400).json(refund.message)
    }
    findOrder.orderStatus=OrderStatus.REFUNDED;
    await findOrder.save();
    res.status(200).json({message:"order refunded is successfully"})

}