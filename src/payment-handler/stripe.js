
import Srtipe, { Stripe } from 'stripe'
import { Coupon } from '../../DB/models/index.js';

// create checkout session
export const createCheckoutSession=async(
    {customer_email,metadata,discounts,line_items
    }
)=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const paymentData=await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:'payment',
        customer_email,
        metadata,
        discounts,
        success_url:process.env.SUCCESS_URL,
        cancel_url:process.env.CANCEL_URL,
        line_items
    });
    return paymentData;
}

// create stripe coupon

export const createStripeCoupon=async({couponId})=>{
    const findCoupon =await Coupon.findById(couponId)
    if(!findCoupon){
        return res.status(404).json({message:"coupon not found"})
    }
    let couponObj={}
    if(findCoupon.CouponType === CouponTypes.AMOUNT){
       couponObj={
        name:findCoupon.CouponCode,
        amount_off:findCoupon.CouponAmount * 100,
        currency:"egp"

       }
    }
    if(findCoupon.CouponType === CouponTypes.PERCENTAGE){
        couponObj={
         name:findCoupon.CouponCode,
         percent_off:findCoupon.CouponAmount 
        }
     }
     const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
     const stripeCoupon=await stripe.coupons.create(couponObj);
     return stripeCoupon;
}
// create payment method
export const createPaymentMethod=async({token})=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
         token
        }
      });
      return paymentMethod
}
// create payment ntent
export const createPaymentIntent=async({amount,currency})=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const paymentMethod=await createPaymentMethod({token:"tok_visa"})
    console.log("paymentMethod",paymentMethod);
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects:"never"
        },
        payment_method:paymentMethod.id
      });

      return paymentIntent
}
// retrive payment intent
export const retrivePayentMethod=async({paymentIntentId})=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId)

    return paymentIntent;
}
 // confirm payment method
 export const confirm=async({paymentIntentId})=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const paymentDetails=await retrivePayentMethod({paymentIntentId})
    const paymentIntent=await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
            payment_method:paymentDetails.payment_method,
        }
    );
    return paymentIntent
 }
 // refund payment data
 export const refundPaymentData=async({paymentIntentId})=>{
    const stripe=new Srtipe(process.env.SECRET_STRIPE_KEY)
    const refund=await stripe.refunds.create({
        payment_intent:paymentIntentId
    })
    return refund
 }