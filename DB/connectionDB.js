import mongoose from "mongoose";


const connectionDB=async()=>{
    return await mongoose.connect(process.env.CONNECTIONT_DB_URI)
    .then(()=>{
        console.log('database connected success');
    }).catch((error)=>{
        console.log('Error in database connected',error);
    })
}

export default connectionDB