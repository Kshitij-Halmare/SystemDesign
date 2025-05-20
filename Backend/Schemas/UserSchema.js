import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Provide email"],
    trim: true,
    unique: true
  },
  occupation: {
    type: String,
    required: [true, "Provide occupation"],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, "Provide date of birth"]
  },
  password: {
    type: String,
    required: [true, "Provide password"],
    trim: true
  },
  
  image: {
    type: String, // if storing as base64 or URL
    default: null
  }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;
