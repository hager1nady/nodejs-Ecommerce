
import express from 'express'
import { config } from 'dotenv'
import dbConnection from './DB/connectionDB.js'
import { globaleResponse } from './src/middleware/error-handling.middleware.js'
import * as router from './src/modules/index.js'
import { disableCouponCronJob } from './src/utils/crons.utils.js'
import { gracefulShutdown } from 'node-schedule'




let port = 3000
const app = express()
app.use(express.json())
config()

app.use(globaleResponse)
app.use('/category',router.categoryRouter)
app.use('/sub-category',router.subCategoryRouter)
app.use('/product',router.productRouter)
app.use('/brand',router.brandRouter)
app.use('/user',router.userRouter)
app.use('/address',router.addressRouter)
app.use('/cart',router.cartRouter)
app.use('/coupon',router.couponRouter)
app.use('/order',router.orderRouter)
app.use('/review',router.reviewRouter)

app.use('*',(req,res,next)=>{
    res.status(404).json({message:"Route not found"})
})

dbConnection()
disableCouponCronJob()
gracefulShutdown()
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))