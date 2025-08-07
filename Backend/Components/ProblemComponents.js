import { Router } from "express";
import Problem from "../Schemas/ProblemSchema.js";
import uploadImageCloudinary from "../Utils/uploadImage.js"; // Adjust path as needed

const ProblemRouter = Router();

export const ProblemInput = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      difficulty, 
      hints, 
      tags, 
      views, 
      likes, 
      reviewed, 
      solutionWorkspace, 
      writtenSolution 
    } = req.body;
    const userId = req.user.userId; // Based on your commented code structure
    
    console.log('Request data:', { 
      title, 
      description, 
      difficulty, 
      hints, 
      tags, 
      views, 
      likes, 
      reviewed,
      solutionWorkspace: solutionWorkspace ? 'provided' : 'not provided',
      writtenSolution: writtenSolution ? `${writtenSolution.length} chars` : 'not provided'
    });
    console.log('User:', req.user);
    console.log('Files:', req.files ? req.files.length : 0);
    
    // Validate required fields
    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and difficulty are required"
      });
    }
    
    // Parse hints and tags if they're sent as strings
    let parsedHints = [];
    let parsedTags = [];
    let parsedSolutionWorkspace = null;
    
    try {
      parsedHints = typeof hints === 'string' ? JSON.parse(hints) : (hints || []);
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
      
      // Parse solution workspace if provided
      if (solutionWorkspace) {
        parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
          ? JSON.parse(solutionWorkspace) 
          : solutionWorkspace;
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid format for hints, tags, or solution workspace"
      });
    }
    
    // Validate arrays
    if (parsedHints.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 hints allowed"
      });
    }
    
    if (parsedTags.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 tags allowed"
      });
    }

    // Validate that at least one form of solution is provided
    const hasWorkspaceSolution = parsedSolutionWorkspace && 
      parsedSolutionWorkspace.nodes && 
      parsedSolutionWorkspace.nodes.length > 0;
    
    const hasWrittenSolution = writtenSolution && writtenSolution.trim().length > 0;
    
    if (!hasWorkspaceSolution && !hasWrittenSolution) {
      return res.status(400).json({
        success: false,
        message: "At least one form of solution (workspace design or written solution) is required"
      });
    }
    
    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} images...`);
      
      try {
        // Upload each image to cloudinary using your existing function
        const uploadPromises = req.files.map(async (file, index) => {
          try {
            console.log(`Uploading image ${index + 1}: ${file.originalname}`);
            const result = await uploadImageCloudinary(file.buffer);
            
            return {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
              size: file.size,
              format: result.format || 'unknown'
            };
          } catch (uploadError) {
            console.error(`Error uploading image ${index + 1}:`, uploadError);
            throw new Error(`Failed to upload image: ${file.originalname}`);
          }
        });
        
        imageUrls = await Promise.all(uploadPromises);
        console.log(`Successfully uploaded ${imageUrls.length} images`);
        
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: uploadError.message
        });
      }
    }
    
    // Parse description if it's a JSON string (like in your commented code)
    let parsedDescription;
    try {
      parsedDescription = typeof description === 'string' ? JSON.parse(description) : description;
    } catch (descError) {
      // If parsing fails, treat as plain text
      parsedDescription = description;
    }
    
    // Create problem using your Mongoose schema
    const problem = new Problem({
      title: title.trim(),
      description: parsedDescription,
      difficulty: difficulty.toLowerCase(),
      hints: parsedHints.map(hint => hint.trim()).filter(hint => hint.length > 0),
      tags: parsedTags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0),
      images: imageUrls, // Array of image objects with url, publicId, etc.
      solutionWorkspace: parsedSolutionWorkspace, // Solution workspace data
      writtenSolution: writtenSolution ? writtenSolution.trim() : '', // Written solution
      views: parseInt(views) || 0,
      likes: parseInt(likes) || 0,
      reviewed: reviewed === 'true' || reviewed === true || false,
      createdBy: userId
    });
    
    console.log('Problem object before save:', {
      ...problem.toObject(),
      solutionWorkspace: problem.solutionWorkspace ? 'workspace provided' : 'no workspace',
      writtenSolution: problem.writtenSolution ? `${problem.writtenSolution.length} chars` : 'no written solution'
    });
    
    await problem.save();
    
    console.log('Problem created successfully:', problem._id);
    
    res.status(201).json({
      success: true,
      message: "Problem and solution created successfully",
      data: {
        id: problem._id,
        problemId: problem.problemId,
        title: problem.title,
        difficulty: problem.difficulty,
        hintsCount: problem.hints.length,
        tagsCount: problem.tags.length,
        imagesCount: problem.images.length,
        hasSolution: problem.hasSolution, // Using virtual
        hasWorkspaceSolution: !!(parsedSolutionWorkspace && parsedSolutionWorkspace.nodes && parsedSolutionWorkspace.nodes.length > 0),
        hasWrittenSolution: !!(writtenSolution && writtenSolution.trim().length > 0),
        createdAt: problem.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error in ProblemInput:', error);
    
    // If it's a MongoDB validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Utility function for cleanup if needed
export const cleanupImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;
  
  const { v2: cloudinary } = await import('cloudinary');
  
  const deletePromises = imageUrls.map(async (image) => {
    try {
      await cloudinary.uploader.destroy(image.publicId);
      console.log(`Deleted image: ${image.publicId}`);
    } catch (error) {
      console.error(`Failed to delete image ${image.publicId}:`, error);
    }
  });
  
  await Promise.allSettled(deletePromises);
};

export const getProblem = async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate('createdBy', 'name email') // Assuming User has name and email
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`Retrieved ${problems.length} problems`);
    
    return res.status(200).json({
      message: "Successfully retrieved problems",
      data: problems,
      success: true
    });
  } catch (error) {
    console.error('Error in getProblem:', error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false
    });
  }
};

export const getSpecificProblem = async (req, res) => {
  try {
    const { problemId } = req.body;
    
    if (!problemId) {
      return res.status(400).json({
        message: "Problem ID is required",
        success: false
      });
    }
    
    console.log('Searching for problem with ID:', problemId);
    
    // Search by both _id and problemId (nanoid) to be flexible
    const problem = await Problem.findOne({
      $or: [
        { _id: problemId },
        { problemId: problemId }
      ]
    }).populate('createdBy', 'name email');
    
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
        success: false
      });
    }
    
    // Increment view count
    await Problem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    
    console.log('Problem found:', problem._id);
    
    return res.status(200).json({
      message: "Successfully retrieved problem",
      data: problem,
      success: true
    });
  } catch (error) {
    console.error('Error in getSpecificProblem:', error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false
    });
  }
};

export default ProblemRouter;