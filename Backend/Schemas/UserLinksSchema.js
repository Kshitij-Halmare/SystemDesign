import mongoose from "mongoose";
const UserLinkSchema=new mongoose.Schema({
    github:{
        type:String
    },
    portfolio_website:{
        type:String
    },
    linkedin:{
        type:String
    }
})

const UserLink=mongoose.model("UserLink",UserLinkSchema);
export default UserLink;