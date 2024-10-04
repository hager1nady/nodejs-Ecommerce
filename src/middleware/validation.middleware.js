// import { ErrorClass } from "../utils/error-class.utils.js";


/**
 * @param {object} schema - Joi schema object
 * @returns  {Function} - Middleware function
 * @description - Middleware function to validate the request data against the schema
*/

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    // خصائص الطلب التي نريد التحقق منها
    const reqKeys = ['body', 'params', 'query','user'];
    // مصفوفة لتخزين الأخطاء
    const validationErrors = [];
    
    // تحقق من كل جزء من req (body, params, query)
    for (const key of reqKeys) {
      if (schema[key]) {
        // تحقق من البيانات مقابل المخطط
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });

        // إذا كان هناك خطأ، ضف التفاصيل إلى مصفوفة الأخطاء
        if (validationResult.error) {
          validationErrors.push(...validationResult.error.details);
        }
      }
    }

    // إذا كانت هناك أخطاء، قم بإرجاع رسالة خطأ
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "Validation Error",
        errors: validationErrors
      });
    }

    // إذا لم يكن هناك أخطاء، انتقل إلى الدالة التالية
    next();
  };
};