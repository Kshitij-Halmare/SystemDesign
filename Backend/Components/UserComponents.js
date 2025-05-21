import User from "../Schemas/UserSchema.js";
import uploadImageCloudinary from "../Utils/uploadImage.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { userIdCreation } from "../Utils/UserIdCreation.js";

export async function Register(req, res) {
  const { name, email, password, confirmPassword, occupation, dob } = req.body;
  const file = req.file;

  // Validation
  if (!name || !email || !password || !confirmPassword || !occupation || !dob) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  try {
    // Check if user exists - optimized to single query
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (file) {
      const uploadResult = await uploadImageCloudinary(file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      occupation,
      dob,
      userId: userIdCreation(), // Removed await since it's synchronous
      password: hashedPassword,
      image: imageUrl,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return response without sensitive data
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      occupation: newUser.occupation,
      dob: newUser.dob,
      image: newUser.image,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token: token // Send token to client
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function Signin(req, res) {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist"
      });
    }

    // Fixed: Added await for password comparison
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: "User successfully logged in",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}