import { hashSync } from "bcrypt";
import mongoose from "../global-setUp.js";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:["male","female"]
    },
    userType:{
        type:String,
        required:true,
        enum:["admin","buyer"]
    },
    passwordChangeAt:Date,
    otp:String
},{timestamps:true})

//===============================Document Middleware=======================
userSchema.pre('save',function (next) {
    // console.log('==========Pre Hook======================',this);
    if(this.isModified("password")){
    this.password=hashSync(this.password,+process.env.SALT_ROUND)  
    // console.log('==========Pre Hook======================',this);

    }  
    next()
})





// ====================================query middleware=======================

export const User=mongoose.models.User || mongoose.model("User",userSchema)