import { Router } from "express";
import multer from "multer";
import { ProblemInput } from "../Components/ProblemComponents.js";
import { verifyToken } from "../Middleware/auth.js";

const ProblemRouter = Router();

// Configure multer for memory storage with multiple file support
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5, // Maximum 5 files
    fieldSize: 10 * 1024 * 1024 // 10MB total field size
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      // Additional check for specific image types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed'), false);
      }
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB per image.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum is 5 images.'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          error: 'Field value too large.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error: ' + error.message
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  next();
};

// Route with multiple image upload support
ProblemRouter.post(
  "/problemInput",
  verifyToken,
  upload.array('images', 5), // 'images' is the field name, max 5 files
  handleMulterError,
  ProblemInput
);

export default ProblemRouter;

// Example of how the ProblemInput component would handle the images:
/*
// In ProblemComponents.js

import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure cloudinary (or your preferred image storage service)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const ProblemInput = async (req, res) => {
  try {
    const { title, description, difficulty, hints, tags } = req.body;
    const userId = req.user.id; // From verifyToken middleware
    
    // Parse hints and tags if they're sent as strings
    const parsedHints = typeof hints === 'string' ? JSON.parse(hints) : hints || [];
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || [];
    
    // Validate required fields
    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and difficulty are required'
      });
    }
    
    // Validate arrays
    if (parsedHints.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 hints allowed'
      });
    }
    
    if (parsedTags.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 tags allowed'
      });
    }
    
    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} images...`);
      
      // Upload each image to cloudinary
      const uploadPromises = req.files.map(async (file, index) => {
        try {
          // Create unique filename
          const filename = `problem_${uuidv4()}_${Date.now()}_${index}`;
          
          // Upload to cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
              {
                resource_type: 'image',
                public_id: filename,
                folder: 'problem_images', // Organize in folders
                transformation: [
                  { width: 1200, height: 800, crop: 'limit' }, // Resize large images
                  { quality: 'auto' } // Auto optimize quality
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(file.buffer);
          });
          
          return {
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
            size: file.size,
            format: result.format
          };
        } catch (uploadError) {
          console.error(`Error uploading image ${index}:`, uploadError);
          throw new Error(`Failed to upload image: ${file.originalname}`);
        }
      });
      
      try {
        imageUrls = await Promise.all(uploadPromises);
        console.log('All images uploaded successfully:', imageUrls.length);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          error: uploadError.message
        });
      }
    }
    
    // Create problem object
    const problemData = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty.toLowerCase(),
      hints: parsedHints.map(hint => hint.trim()).filter(hint => hint.length > 0),
      tags: parsedTags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0),
      images: imageUrls,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database (example with MongoDB/Mongoose)
    // const problem = new Problem(problemData);
    // await problem.save();
    
    // Or with a different database:
    // await db.problems.insert(problemData);
    
    console.log('Problem created successfully:', problemData.id);
    
    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: {
        id: problemData.id,
        title: problemData.title,
        difficulty: problemData.difficulty,
        hintsCount: problemData.hints.length,
        tagsCount: problemData.tags.length,
        imagesCount: problemData.images.length,
        createdAt: problemData.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error in ProblemInput:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Additional utility function for deleting images if problem creation fails
const cleanupImages = async (imageUrls) => {
  const deletePromises = imageUrls.map(async (image) => {
    try {
      await cloudinary.v2.uploader.destroy(image.publicId);
      console.log(`Deleted image: ${image.publicId}`);
    } catch (error) {
      console.error(`Failed to delete image ${image.publicId}:`, error);
    }
  });
  
  await Promise.allSettled(deletePromises);
};
*/