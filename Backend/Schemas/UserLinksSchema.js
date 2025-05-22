import mongoose from "mongoose";
import User from "./UserSchema";
const UserLinkSchema=new mongoose.Schema({
    github:{
        type:String
    },
    portfolio_website:{
        type:String
    },
    linkedin:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required: [true, "Links must be associated with a user"]
    }
})

const UserLink=mongoose.model("UserLink",UserLinkSchema);
export default UserLink;