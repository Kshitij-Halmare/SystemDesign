import User from "../Schemas/UserSchema.js";
import uploadImageCloudinary from "../Utils/uploadImage.js";
import bcryptjs from "bcryptjs";

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
    // Check if user exists
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
      console.log("Uploading image to Cloudinary...");
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
      password: hashedPassword,
      image: imageUrl,
    });

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
    console.log(userResponse);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}