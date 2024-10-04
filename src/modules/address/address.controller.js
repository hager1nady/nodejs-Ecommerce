import { Address } from "../../../DB/models/index.js"

/**
 * @api{post}/addAdress addeNewAddress
 */
export const addNewAddress=async(req,res,next)=>{
    const {country,city,postalCode,buildingNumber,floorNumber,addressLabel,setAsDefault}=req.body
    const userId=req.user._id
    // address object
    const newAdddress=new Address(
        {   
            userId,
            country,city,postalCode,buildingNumber,floorNumber,addressLabel,setAsDefault,
            isDefault:[true,false].includes(setAsDefault)?setAsDefault:false
        }
    )
    if(newAdddress.isDefault){
        await Address.updateMany({userId,isDefault:true},{isDefault:false})
    }
    const address=await newAdddress.save()
    res.status(200).json({
        status: "success",
        message: "add New Address successfully",
        data: address

      });
}
/**
 * @api{put}/update update address
 */
export const updateAddress=async(req,res,next)=>{
    const {country,city,postalCode,buildingNumber,floorNumber,addressLabel,setAsDefault}=req.body
    const userId=req.user._id
    // const {addressId}=req.params
    const { addressId } = req.params
    console.log({addressId});
    const address=await Address.findOne({_id:addressId,userId})  
    console.log({userId});
    console.log(
        {address}
    );
    
    
    if(!address){
        return res.status(404).json({message:'address not found'})
    }  
    if(country) address.country=country
    if(city) address.city=city
    if(postalCode) address.postalCode=postalCode
    if(buildingNumber) address.floorNumber=floorNumber
    if(addressLabel) address.addressLabel=addressLabel
    if([true,false].includes(setAsDefault)){
        address.isDefault=[true,false].includes(setAsDefault)?setAsDefault:false
         await Address.updateMany({userId,isDefault:true},{isDefault:false})

    } 
    await address.save()
    res.status(200).json({message:'updated success',address})
}
/**
 * @api{delete}/delete remove address
 */
export const removeAddress=async(req,res,next)=>{
    const userId=req.user._id
    const { addressId } = req.params

    const address=await Address.findOneAndUpdate({_id:addressId,userId,isMarkedAsDeleted:false},{isMarkedAsDeleted:true,isDefault:false},{new:true})
    if(!address){
        return res.status(404).json({message:"address not found"})
    }
    await address.save()
    res.status(200).json({message:'deleted success',address})

}
/**
 * @api{get}/list addresses
 */
export const listAddresses=async(req,res,next)=>{
    const userId=req.user._id
    const addresses=await Address.find({userId,isMarkedAsDeleted:false})
    res.status(200).json({message:'list all addresses',addresses})
}