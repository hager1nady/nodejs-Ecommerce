import Joi from "joi";
import { CouponTypes } from "../../utils/index.js";
import { generalRules } from "../../utils/genera-rules.js";


export const createCouponSchema={
    body:Joi.object({
        CouponCode:Joi.string().required(),
        from:Joi.date().greater(Date.now()).required(),
        till:Joi.date().greater(Joi.ref('from')).required(),
        users:Joi.array().items(Joi.object({
            userId:generalRules._id.required(),
            maxCount:Joi.number().min(1).required()
        })),
        CouponType:Joi.string().valid(...Object.values(CouponTypes)).required(),
        CouponAmount:Joi.number().when('couponType',{
            is:Joi.string().valid(CouponTypes.PERCENTAGE),
            then:Joi.number().max(100).required()
        }).min(1).required().messages({
            'number.min':'coupon amount must be greater than 0',
            'number.max':'coupon amount must be less than 100'

        })
    })
}

export const updateCouponSchema={
    body:Joi.object({
        CouponCode:Joi.string().optional(),
        from:Joi.date().greater(Date.now()).optional(),
        till:Joi.date().greater(Joi.ref('from')).optional(),
        users:Joi.array().items(Joi.object({
            userId:generalRules._id.optional(),
            maxCount:Joi.number().min(1).optional()
        })).optional(),
        CouponType:Joi.string().valid(...Object.values(CouponTypes)).optional(),
        CouponAmount:Joi.number().when('couponType',{
            is:Joi.string().valid(CouponTypes.PERCENTAGE),
            then:Joi.number().max(100).optional()
        }).min(1).optional().messages({
            'number.min':'coupon amount must be greater than 0',
            'number.max':'coupon amount must be less than 100'
        })
    }),
    params:Joi.object({
        couponId:generalRules._id.required()
    }),
    user:Joi.object({
        _id:generalRules._id.required()
    }).options({allowUnknown:true})
}