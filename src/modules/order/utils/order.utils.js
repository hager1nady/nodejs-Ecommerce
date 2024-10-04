import { DateTime } from "luxon"
import { Coupon } from "../../../../DB/models/index.js"
import { DiscountType } from "../../../utils/enums.utils.js"

export const validateCoupon=async(couponCode,userId,res)=>{
    // get coupon by coupon code
    const coupon=await Coupon.findOne({couponCode})
    if(!coupon){
        return res.status(400).json({message:"invalid coupon code",error:true})
    }
    // check if coupon isEnabled || coupon is expired
    if(!coupon.isEnable || DateTime.now() > DateTime.fromJSDate(enabledCoupon[0].till)){
        return res.status(400).json({message:"coupon is not enabled or coupon expired",error:true})
    }
    // check if coupon not started yet
    if(DateTime.now() < DateTime.fromJSDate(coupon.from)){
        return res.status(400).json({message:"coupon is not started yet",error:true})
    }
    // check if coupon is not eligible
    const isUserNotEligible=coupon.users.some(u=>u.userId.toString() !== userId.toString() || (u.userId.toString()=== userId.toString()&&u.maxCount<=u.usageCount))
    console.log({isUserNotEligible});
    if(isUserNotEligible){
        return res.status(400).json({message:"coupon is not eligible to use coupon or you redeem all your tries",error:true})
    }
    return {error : false,coupon}
}

// import { DiscountType } from "./index.js";

    

export const applyCoupon = (subTotal, coupon) => {
    let total=subTotal;
    const {couponAmount:discountAmount,couponType:discountType}=coupon
    if (discountType == DiscountType.PERCENTAGE) {
      total = subTotal- (subTotal* discount.amount) / 100;
    } else if (discount.type === DiscountType.FIXED) {
        if(discountAmount > subTotal){
            return total
        }
      appliedPrice= subTotal- discount.amount;
    }
    return total;
  };