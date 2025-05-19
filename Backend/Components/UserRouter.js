import User from "../Schemas/UserSchema.js"
export async function Register(req,res) {
    const body=req.body;
    if(!body){
        return res.json({
            message:"Send correct Data",
            success:false,
            error:true
        })
    }
}