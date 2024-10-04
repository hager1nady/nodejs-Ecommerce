



import { User } from "../../DB/models/index.js";
// import userModel from "../../DB/models/user.modl.js";
import jwt from 'jsonwebtoken'
export const auth= () =>{
   try{
    return async(req,res,next)=>{
        const {token}=req.headers
        if(!token){
         return res.status(400).json({message:"token not exist"})
        }
        /// check bearer token/////////
        if(!token.startsWith("ahmed__")){
            return res.status(400).json({message:"token is not valid"})
        }
        ///////// split bearerr ////////////
        const newToken=token.split("ahmed__")[1]
        // console.log(newToken);
        if(!newToken){
         return res.status(400).json({message:"token not found"})

        }
        const decoded=jwt.verify(newToken,"ahmed")
        
        if(!decoded){
         return res.status(400).json({message:"invalid payload"})
        }
        console.log(decoded);
      
        const userExist=await User.findById(decoded.id)
        if(!userExist ){
         return res.status(400).json({message:"user not found"})
     }
     /////////////// data to enter the next midddlware with old request//////////
     
       
         req.user=userExist     
        next()
    }
   }catch(error){
    return res.status(400).json({message:"catch error"})
   }
}