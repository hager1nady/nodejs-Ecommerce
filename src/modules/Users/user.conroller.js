import { compareSync, hashSync } from "bcrypt"
import { Address, User } from "../../../DB/models/index.js"
import jwt from 'jsonwebtoken'


/***
 * @api {post}/users signup
 */
export const signUp=async(req,res,next)=>{
    const {username,email,password,age,gender,phone,userType,country,city,postalCode,buildingNumber,floorNumber,addressLabel}=req.body
    // check is email exist or not
    const isEmailExist=await User.findOne({email})
    if(isEmailExist){
        return res.status(400).json({message: 'email is already exist'})
    }
    // hashed passowrd
    // const hashedPassword=hashSync(password,+process.env.SALT_ROUND)

    // user object
    const userObj=new User({
        username,
        email,
        password,
        age,
        gender,
        phone,
        userType
    })

    // creat new addrrerss
    const addressInstanse=new Address({
        userId:userObj._id,country,city,postalCode,buildingNumber,floorNumber,addressLabel,isDefault:true
    })
    const addressSaved=await addressInstanse.save()
    const newUser=await userObj.save()
    res.status(200).json({
        status: "success",
        message: "sign up successfully",
        data: newUser,addressSaved,
      });
}

/**
 * @api{post}/signIn sign in
 */
export const signIn=async(req,res,next)=>{
    // const userId=req.user._id
    const{email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:'invalid login password'})
    }
    const isMatch=compareSync(password,user.password)
    if(!isMatch){
        return res.status(400).json({message:'invalid email or password'})
    }
    // generate token
    const token=jwt.sign({id:user._id,username:user.username,email},"ahmed")
    await user.save();
    res.status(200).json({
        status: "success",
        message: "sign in successfully",
        data: token,
      });
}




/**
 * @api {put}/user/update
 */
export const updateAccount=async(req,res,next)=>{
    const {userId}=req.params
    const {password,username}=req.body
    // find user froomm database
    const user=await User.findById(userId)
    if(!user){
        return res.status(404).json({message:'user not found'})
    }
    if(password){
        user.password=password
    }
    if(username){
        user.username=username
    }
    await user.save()

    res.status(200).json({
        status: "success",
        message: "update account successfully",
        data: user,
      });

}
