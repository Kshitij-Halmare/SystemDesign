import User from "../Schemas/UserSchema.js"
import uploadImageCloudinary from "../Utils/uploadImage.js";
import bcryptjs from "bcryptjs";
export async function Register(req,res) {
    const {name,email,password,occupation,dob}=req.body;
    const file=req.file;
    try{
        const extinguisher=User.findOne({email:email});
        if(extinguisher){
             return res.status(400).json({
                success: false,
                error: true,
                message: "User already exists, please log in.",
            });
        }
        let imageurl=null;
        if (file) {
            const uploadResult = await uploadImageCloudinary(file.buffer); 
            console.log(uploadResult);  
            imageurl = uploadResult.secure_url;
        }
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const newUser=await User.create({
            name,
            email,
            occupation,
            dob,
            password:hashedPassword,
            imageurl         
        })
         return res.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully. Please verify your email.",
        });
    }catch (error) {
        console.error(error);  
        return res.status(500).json({
            success: false,
            error: true,
            message: `An error occurred: ${error.message}`,
        });
    }
}