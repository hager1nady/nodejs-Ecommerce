import { scheduleJob } from "node-schedule";
import { Coupon } from "../../DB/models/index.js";
import { DateTime } from "luxon";

export const disableCouponCronJob=()=>{
    scheduleJob('* 59 23 * * *',async()=>{
        console.log('cron job to disable coupon disableCouponCronJob()')
        const enabledCoupon= await Coupon.find({isEnable:true})
        console.log('enabledCoupon',enabledCoupon);
        //2024-09-07T21:00:00.000Z
       
      if(enabledCoupon.length>0){
        for (const coupon of enabledCoupon) {
            if(DateTime.now()>DateTime.fromJSDate(enabledCoupon[0].till)){
                console.log({code:DateTime.now()>DateTime.fromJSDate(enabledCoupon[0].till)});
                
                coupon.isEnable=false
                await coupon.save()
            }
        }
      }
        
        
    })
}