import { Router } from "express";
import Problem from "../Schemas/ProblemSchema.js";
import uploadImageCloudinary from "../Utils/uploadImage.js";

const ProblemRouter = Router();

// Create a new problem (by creator)
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
    const userId = req.user.userId;
    
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
        if (typeof solutionWorkspace === 'string') {
          parsedSolutionWorkspace = JSON.parse(solutionWorkspace);
        } else {
          parsedSolutionWorkspace = solutionWorkspace;
        }
        
        // Ensure the workspace has the correct structure
        if (!parsedSolutionWorkspace.nodes) {
          parsedSolutionWorkspace.nodes = [];
        }
        if (!parsedSolutionWorkspace.edges) {
          parsedSolutionWorkspace.edges = [];
        }
        if (!parsedSolutionWorkspace.notes) {
          parsedSolutionWorkspace.notes = '';
        }
        
        // Validate node structure for ReactFlow compatibility
        parsedSolutionWorkspace.nodes = parsedSolutionWorkspace.nodes.map(node => ({
          id: node.id || `node_${Date.now()}_${Math.random()}`,
          type: node.type || 'default',
          position: node.position || { x: 0, y: 0 },
          data: node.data || { label: node.label || 'Component' }
        }));
        
        // Validate edge structure
        parsedSolutionWorkspace.edges = parsedSolutionWorkspace.edges.map(edge => ({
          id: edge.id || `edge_${Date.now()}_${Math.random()}`,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default'
        }));
        
        console.log('Parsed solution workspace:', {
          nodes: parsedSolutionWorkspace.nodes.length,
          edges: parsedSolutionWorkspace.edges.length,
          notes: parsedSolutionWorkspace.notes ? 'provided' : 'empty'
        });
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
    
    // Parse description if it's a JSON string
    let parsedDescription;
    try {
      parsedDescription = typeof description === 'string' ? JSON.parse(description) : description;
    } catch (descError) {
      parsedDescription = description;
    }
    
    // NEW: Create the best solution object (creator's solution)
    const bestSolutionData = {
      submittedBy: userId,
      solutionWorkspace: parsedSolutionWorkspace,
      writtenSolution: writtenSolution ? writtenSolution.trim() : '',
      isApproved: true, // Creator's solution is auto-approved
      votes: 0
    };
    
    // Create problem with best solution
    const problem = new Problem({
      title: title.trim(),
      description: parsedDescription,
      difficulty: difficulty.toLowerCase(),
      hints: parsedHints.map(hint => hint.trim()).filter(hint => hint.length > 0),
      tags: parsedTags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0),
      images: imageUrls,
      bestSolution: bestSolutionData, // Store creator's solution as best
      userSolutions: [], // Initialize empty array for user solutions
      views: parseInt(views) || 0,
      likes: parseInt(likes) || 0,
      reviewed: reviewed === 'true' || reviewed === true || false,
      createdBy: userId
    });
    
    console.log('Problem object before save:', {
      title: problem.title,
      difficulty: problem.difficulty,
      hintsCount: problem.hints.length,
      tagsCount: problem.tags.length,
      imagesCount: problem.images.length,
      hasBestSolution: !!problem.bestSolution
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
        hasBestSolution: problem.hasBestSolution,
        totalSolutionsCount: problem.totalSolutionsCount,
        createdAt: problem.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error in ProblemInput:', error);
    
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

// NEW: Submit a user solution
// export const submitUserSolution = async (req, res) => {
//   try {
//     const { problemId, solutionWorkspace, writtenSolution,userId } = req.body;
//     // const userId = req.user.userId;
//     console.log('Submitting solution for problemId:', problemId, 'by userId:', userId,solutionWorkspace,writtenSolution);
//     if (!problemId) {
//       return res.status(400).json({
//         success: false,
//         message: "Problem ID is required"
//       });
//     }
    
//     // Parse solution workspace if provided
//     let parsedSolutionWorkspace = null;
//     if (solutionWorkspace) {
//       try {
//         parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
//           ? JSON.parse(solutionWorkspace) 
//           : solutionWorkspace;
//       } catch (parseError) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid solution workspace format"
//         });
//       }
//     }
    
//     // Validate that at least one form of solution is provided
//     const hasWorkspaceSolution = parsedSolutionWorkspace && 
//       parsedSolutionWorkspace.nodes && 
//       parsedSolutionWorkspace.nodes.length > 0;
    
//     const hasWrittenSolution = writtenSolution && writtenSolution.trim().length > 0;
    
//     if (!hasWorkspaceSolution && !hasWrittenSolution) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one form of solution (workspace design or written solution) is required"
//       });
//     }
    
//     // Find the problem
//     const problem = await Problem.findOne({ problemId });
    
//     if (!problem) {
//       return res.status(404).json({
//         success: false,
//         message: "Problem not found"
//       });
//     }
    
//     // Check if user already submitted a solution
//     const existingSolution = problem.userSolutions.find(
//       sol => sol.submittedBy.toString() === userId
//     );
    
//     if (existingSolution) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already submitted a solution for this problem"
//       });
//     }
    
//     // Create solution data
//     const solutionData = {
//       submittedBy: userId,
//       solutionWorkspace: parsedSolutionWorkspace,
//       writtenSolution: writtenSolution ? writtenSolution.trim() : '',
//       isApproved: false,
//       votes: 0
//     };
    
//     // Add solution using the method
//     await problem.addUserSolution(solutionData);
    
//     return res.status(201).json({
//       success: true,
//       message: "Solution submitted successfully",
//       data: {
//         problemId: problem.problemId,
//         totalSolutions: problem.totalSolutionsCount
//       }
//     });
    
//   } catch (error) {
//     console.error('Error in submitUserSolution:', error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to submit solution"
//     });
//   }
// };
// FIXED: Submit a user solution
// export const submitUserSolution = async (req, res) => {
//   try {
//     const { problemId, solutionWorkspace, writtenSolution, userId } = req.body;
//     // Uncomment this if you're using auth middleware instead
//     // const userId = req.user.userId;
    
//     console.log('Submitting solution for problemId:', problemId, 'by userId:', userId);
    
//     if (!problemId) {
//       return res.status(400).json({
//         success: false,
//         message: "Problem ID is required"
//       });
//     }

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }
    
//     // Parse solution workspace if provided
//     let parsedSolutionWorkspace = null;
//     if (solutionWorkspace) {
//       try {
//         parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
//           ? JSON.parse(solutionWorkspace) 
//           : solutionWorkspace;
        
//         console.log('Parsed workspace:', {
//           hasNodes: !!parsedSolutionWorkspace.nodes,
//           nodesCount: parsedSolutionWorkspace.nodes?.length || 0,
//           hasEdges: !!parsedSolutionWorkspace.edges,
//           edgesCount: parsedSolutionWorkspace.edges?.length || 0
//         });
//       } catch (parseError) {
//         console.error('Parse error:', parseError);
//         return res.status(400).json({
//           success: false,
//           message: "Invalid solution workspace format"
//         });
//       }
//     }
    
//     // Validate that at least one form of solution is provided
//     const hasWorkspaceSolution = parsedSolutionWorkspace && 
//       parsedSolutionWorkspace.nodes && 
//       parsedSolutionWorkspace.nodes.length > 0;
    
//     const hasWrittenSolution = writtenSolution && writtenSolution.trim().length > 0;
    
//     console.log('Solution validation:', {
//       hasWorkspaceSolution,
//       hasWrittenSolution,
//       workspaceNodesCount: parsedSolutionWorkspace?.nodes?.length || 0
//     });
    
//     if (!hasWorkspaceSolution && !hasWrittenSolution) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one form of solution (workspace design or written solution) is required"
//       });
//     }
    
//     // Find the problem
//     const problem = await Problem.findOne({ problemId });
    
//     if (!problem) {
//       return res.status(404).json({
//         success: false,
//         message: "Problem not found"
//       });
//     }
    
//     console.log('Problem found:', {
//       problemId: problem.problemId,
//       existingSolutionsCount: problem.userSolutions.length
//     });
    
//     // FIXED: Check if user already submitted a solution
//     // Handle both ObjectId and string comparisons
//     const existingSolution = problem.userSolutions.find(sol => {
//       const solUserId = sol.submittedBy?._id?.toString() || sol.submittedBy?.toString();
//       const currentUserId = userId.toString();
//       console.log('Comparing:', { solUserId, currentUserId, match: solUserId === currentUserId });
//       return solUserId === currentUserId;
//     });
    
//     if (existingSolution) {
//       console.log('User already submitted a solution');
//       return res.status(400).json({
//         success: false,
//         message: "You have already submitted a solution for this problem. You can view it in 'My Solutions'."
//       });
//     }
    
//     // FIXED: Ensure workspace structure is properly formatted
//     if (parsedSolutionWorkspace) {
//       if (!parsedSolutionWorkspace.nodes) parsedSolutionWorkspace.nodes = [];
//       if (!parsedSolutionWorkspace.edges) parsedSolutionWorkspace.edges = [];
//       if (!parsedSolutionWorkspace.notes) parsedSolutionWorkspace.notes = '';
      
//       // Validate and clean node structure
//       parsedSolutionWorkspace.nodes = parsedSolutionWorkspace.nodes.map(node => ({
//         id: node.id || `node_${Date.now()}_${Math.random()}`,
//         type: node.type || 'default',
//         position: node.position || { x: 100, y: 100 },
//         data: node.data || { label: node.label || 'Component' }
//       }));
      
//       // Validate and clean edge structure
//       parsedSolutionWorkspace.edges = parsedSolutionWorkspace.edges.map(edge => ({
//         id: edge.id || `edge_${Date.now()}_${Math.random()}`,
//         source: edge.source,
//         target: edge.target,
//         type: edge.type || 'default'
//       }));
//     }
    
//     // Create solution data
//     const solutionData = {
//       submittedBy: userId,
//       solutionWorkspace: parsedSolutionWorkspace,
//       writtenSolution: writtenSolution ? writtenSolution.trim() : '',
//       isApproved: false,
//       votes: 0,
//       submittedAt: new Date()
//     };
    
//     console.log('Solution data to be added:', {
//       submittedBy: solutionData.submittedBy,
//       hasWorkspace: !!solutionData.solutionWorkspace,
//       hasWritten: !!solutionData.writtenSolution,
//       workspaceNodes: solutionData.solutionWorkspace?.nodes?.length || 0
//     });
    
//     // Add solution using the method
//     await problem.addUserSolution(solutionData);
    
//     console.log('Solution added successfully. New total:', problem.userSolutions.length);
    
//     return res.status(201).json({
//       success: true,
//       message: "Solution submitted successfully",
//       data: {
//         problemId: problem.problemId,
//         totalSolutions: problem.totalSolutionsCount,
//         solutionId: problem.userSolutions[problem.userSolutions.length - 1]._id
//       }
//     });
    
//   } catch (error) {
//     console.error('Error in submitUserSolution:', error);
//     console.error('Error stack:', error.stack);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to submit solution",
//       error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// ALTERNATIVE: If the issue persists, use this version that directly pushes to array
// export const submitUserSolution = async (req, res) => {
//   try {
//     const { problemId, solutionWorkspace, writtenSolution, userId } = req.body;
    
//     console.log('Submitting solution for problemId:', problemId, 'by userId:', userId);
    
//     if (!problemId || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Problem ID and User ID are required"
//       });
//     }
    
//     // Parse solution workspace if provided
//     let parsedSolutionWorkspace = null;
//     if (solutionWorkspace) {
//       try {
//         parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
//           ? JSON.parse(solutionWorkspace) 
//           : solutionWorkspace;
//       } catch (parseError) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid solution workspace format"
//         });
//       }
//     }
    
//     // Validate that at least one form of solution is provided
//     const hasWorkspaceSolution = parsedSolutionWorkspace && 
//       parsedSolutionWorkspace.nodes && 
//       parsedSolutionWorkspace.nodes.length > 0;
    
//     const hasWrittenSolution = writtenSolution && writtenSolution.trim().length > 0;
    
//     if (!hasWorkspaceSolution && !hasWrittenSolution) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one form of solution is required"
//       });
//     }
    
//     // Find the problem
//     const problem = await Problem.findOne({ problemId });
//     console.log(problem);
//     if (!problem) {
//       return res.status(404).json({
//         success: false,
//         message: "Problem not found"
//       });
//     }
    
//     // Check if user already submitted a solution
//     const existingSolution = problem.userSolutions.find(sol => {
//       const solUserId = sol.submittedBy?._id?.toString() || sol.submittedBy?.toString();
//       return solUserId === userId.toString();
//     });
    
//     if (existingSolution) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already submitted a solution for this problem"
//       });
//     }
    
//     // Format workspace properly
//     if (parsedSolutionWorkspace) {
//       parsedSolutionWorkspace.nodes = parsedSolutionWorkspace.nodes || [];
//       parsedSolutionWorkspace.edges = parsedSolutionWorkspace.edges || [];
//       parsedSolutionWorkspace.notes = parsedSolutionWorkspace.notes || '';
//     }
    
//     // ALTERNATIVE APPROACH: Directly push to array and save
//     problem.userSolutions.push({
//       submittedBy: userId,
//       solutionWorkspace: parsedSolutionWorkspace,
//       writtenSolution: writtenSolution ? writtenSolution.trim() : '',
//       isApproved: false,
//       votes: 0,
//       submittedAt: new Date()
//     });
    
//     await problem.save();
    
//     return res.status(201).json({
//       success: true,
//       message: "Solution submitted successfully",
//       data: {
//         problemId: problem.problemId,
//         totalSolutions: problem.userSolutions.length,
//         solutionId: problem.userSolutions[problem.userSolutions.length - 1]._id
//       }
//     });
    
//   } catch (error) {
//     console.error('Error in submitUserSolution:', error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to submit solution"
//     });
//   }
// };


// FIXED: Submit a user solution - ALLOWS MULTIPLE SUBMISSIONS
export const submitUserSolution = async (req, res) => {
  try {
    const { problemId, solutionWorkspace, writtenSolution, userId } = req.body;
    // Uncomment this if you're using auth middleware instead
    // const userId = req.user.userId;
    
    console.log('Submitting solution for problemId:', problemId, 'by userId:', userId);
    
    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required"
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Parse solution workspace if provided
    let parsedSolutionWorkspace = null;
    if (solutionWorkspace) {
      try {
        parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
          ? JSON.parse(solutionWorkspace) 
          : solutionWorkspace;
        
        console.log('Parsed workspace:', {
          hasNodes: !!parsedSolutionWorkspace.nodes,
          nodesCount: parsedSolutionWorkspace.nodes?.length || 0,
          hasEdges: !!parsedSolutionWorkspace.edges,
          edgesCount: parsedSolutionWorkspace.edges?.length || 0
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid solution workspace format"
        });
      }
    }
    
    // Validate that at least one form of solution is provided
    const hasWorkspaceSolution = parsedSolutionWorkspace && 
      parsedSolutionWorkspace.nodes && 
      parsedSolutionWorkspace.nodes.length > 0;
    
    const hasWrittenSolution = writtenSolution && writtenSolution.trim().length > 0;
    
    console.log('Solution validation:', {
      hasWorkspaceSolution,
      hasWrittenSolution,
      workspaceNodesCount: parsedSolutionWorkspace?.nodes?.length || 0
    });
    
    if (!hasWorkspaceSolution && !hasWrittenSolution) {
      return res.status(400).json({
        success: false,
        message: "At least one form of solution (workspace design or written solution) is required"
      });
    }
    
    // Find the problem
    const problem = await Problem.findOne({ problemId });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    console.log('Problem found:', {
      problemId: problem.problemId,
      existingSolutionsCount: problem.userSolutions.length
    });
    
    // REMOVED: The check that was blocking multiple submissions
    // Users can now submit multiple solutions
    const userSolutionsCount = problem.userSolutions.filter(sol => {
      const solUserId = sol.submittedBy?._id?.toString() || sol.submittedBy?.toString();
      return solUserId === userId.toString();
    }).length;
    
    console.log(`User has ${userSolutionsCount} existing solutions. Adding new one.`);
    
    // FIXED: Ensure workspace structure is properly formatted
    if (parsedSolutionWorkspace) {
      if (!parsedSolutionWorkspace.nodes) parsedSolutionWorkspace.nodes = [];
      if (!parsedSolutionWorkspace.edges) parsedSolutionWorkspace.edges = [];
      if (!parsedSolutionWorkspace.notes) parsedSolutionWorkspace.notes = '';
      
      // Validate and clean node structure
      parsedSolutionWorkspace.nodes = parsedSolutionWorkspace.nodes.map(node => ({
        id: node.id || `node_${Date.now()}_${Math.random()}`,
        type: node.type || 'default',
        position: node.position || { x: 100, y: 100 },
        data: node.data || { label: node.label || 'Component' }
      }));
      
      // Validate and clean edge structure
      parsedSolutionWorkspace.edges = parsedSolutionWorkspace.edges.map(edge => ({
        id: edge.id || `edge_${Date.now()}_${Math.random()}`,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default'
      }));
    }
    
    // Create solution data
    const solutionData = {
      submittedBy: userId,
      solutionWorkspace: parsedSolutionWorkspace,
      writtenSolution: writtenSolution ? writtenSolution.trim() : '',
      isApproved: false,
      votes: 0,
      submittedAt: new Date()
    };
    
    console.log('Solution data to be added:', {
      submittedBy: solutionData.submittedBy,
      hasWorkspace: !!solutionData.solutionWorkspace,
      hasWritten: !!solutionData.writtenSolution,
      workspaceNodes: solutionData.solutionWorkspace?.nodes?.length || 0
    });
    
    // Add solution using the method
    await problem.addUserSolution(solutionData);
    
    console.log('Solution added successfully. New total:', problem.userSolutions.length);
    
    // Get the newly added solution
    const newSolution = problem.userSolutions[problem.userSolutions.length - 1];
    
    return res.status(201).json({
      success: true,
      message: "Solution submitted successfully",
      data: {
        problemId: problem.problemId,
        totalSolutions: problem.totalSolutionsCount,
        userSolutionsCount: userSolutionsCount + 1,
        solutionId: newSolution._id,
        solutionNumber: userSolutionsCount + 1
      }
    });
    
  } catch (error) {
    console.error('Error in submitUserSolution:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit solution",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's solutions for a specific problem
export const getUserSolutionsForProblem = async (req, res) => {
  try {
    const { problemId, userId } = req.query;
    // Or from auth: const userId = req.user.userId;
    
    if (!problemId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and User ID are required"
      });
    }
    
    const problem = await Problem.findOne({ problemId })
      .populate('userSolutions.submittedBy', 'name email');
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    // Filter solutions by user
    const userSolutions = problem.userSolutions.filter(sol => {
      const solUserId = sol.submittedBy?._id?.toString() || sol.submittedBy?.toString();
      return solUserId === userId.toString();
    });
    
    // Sort by submission date (newest first)
    userSolutions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    return res.status(200).json({
      success: true,
      message: "User solutions retrieved successfully",
      data: {
        problemId: problem.problemId,
        problemTitle: problem.title,
        solutions: userSolutions,
        totalCount: userSolutions.length
      }
    });
    
  } catch (error) {
    console.error('Error in getUserSolutionsForProblem:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve solutions"
    });
  }
};

// Delete a user's solution
export const deleteUserSolution = async (req, res) => {
  try {
    const { problemId, solutionId, userId } = req.body;
    // Or from auth: const userId = req.user.userId;
    
    if (!problemId || !solutionId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and Solution ID are required"
      });
    }
    
    const problem = await Problem.findOne({ problemId });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    // Find the solution
    const solution = problem.userSolutions.id(solutionId);
    
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found"
      });
    }
    
    // Check if the user owns this solution
    const solutionUserId = solution.submittedBy?._id?.toString() || solution.submittedBy?.toString();
    if (solutionUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own solutions"
      });
    }
    
    // Remove the solution
    problem.userSolutions.pull(solutionId);
    await problem.save();
    
    return res.status(200).json({
      success: true,
      message: "Solution deleted successfully",
      data: {
        problemId: problem.problemId,
        remainingSolutions: problem.totalSolutionsCount
      }
    });
    
  } catch (error) {
    console.error('Error in deleteUserSolution:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete solution"
    });
  }
};

// Update/Edit a user's solution
export const updateUserSolution = async (req, res) => {
  try {
    const { problemId, solutionId, solutionWorkspace, writtenSolution, userId } = req.body;
    // Or from auth: const userId = req.user.userId;
    
    if (!problemId || !solutionId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and Solution ID are required"
      });
    }
    
    const problem = await Problem.findOne({ problemId });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    // Find the solution
    const solution = problem.userSolutions.id(solutionId);
    
    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found"
      });
    }
    
    // Check if the user owns this solution
    const solutionUserId = solution.submittedBy?._id?.toString() || solution.submittedBy?.toString();
    if (solutionUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own solutions"
      });
    }
    
    // Parse solution workspace if provided
    let parsedSolutionWorkspace = null;
    if (solutionWorkspace) {
      try {
        parsedSolutionWorkspace = typeof solutionWorkspace === 'string' 
          ? JSON.parse(solutionWorkspace) 
          : solutionWorkspace;
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid solution workspace format"
        });
      }
    }
    
    // Update solution fields
    if (parsedSolutionWorkspace) {
      solution.solutionWorkspace = parsedSolutionWorkspace;
    }
    if (writtenSolution !== undefined) {
      solution.writtenSolution = writtenSolution.trim();
    }
    
    await problem.save();
    
    return res.status(200).json({
      success: true,
      message: "Solution updated successfully",
      data: {
        problemId: problem.problemId,
        solutionId: solution._id
      }
    });
    
  } catch (error) {
    console.error('Error in updateUserSolution:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update solution"
    });
  }
};


// NEW: Set best solution
export const setBestSolution = async (req, res) => {
  try {
    const { problemId, solutionId } = req.body;
    const userId = req.user.userId;
    
    if (!problemId || !solutionId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and Solution ID are required"
      });
    }
    
    const problem = await Problem.findOne({ problemId });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    // Only problem creator can set best solution
    if (problem.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the problem creator can set the best solution"
      });
    }
    
    await problem.setBestSolution(solutionId);
    
    return res.status(200).json({
      success: true,
      message: "Best solution updated successfully"
    });
    
  } catch (error) {
    console.error('Error in setBestSolution:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to set best solution"
    });
  }
};

// NEW: Upvote a solution
export const upvoteSolution = async (req, res) => {
  try {
    const { problemId, solutionId } = req.body;
    
    if (!problemId || !solutionId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and Solution ID are required"
      });
    }
    
    const problem = await Problem.findOne({ problemId });
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    await problem.upvoteSolution(solutionId);
    
    return res.status(200).json({
      success: true,
      message: "Solution upvoted successfully"
    });
    
  } catch (error) {
    console.error('Error in upvoteSolution:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upvote solution"
    });
  }
};

// NEW: Get all solutions for a problem
export const getProblemSolutions = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required"
      });
    }
    
    const problem = await Problem.findOne({ problemId })
      .populate('bestSolution.submittedBy', 'name email')
      .populate('userSolutions.submittedBy', 'name email');
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }
    
    // Sort user solutions by votes
    const sortedUserSolutions = problem.userSolutions.sort((a, b) => b.votes - a.votes);
    
    return res.status(200).json({
      success: true,
      message: "Solutions retrieved successfully",
      data: {
        bestSolution: problem.bestSolution,
        userSolutions: sortedUserSolutions,
        totalSolutions: problem.totalSolutionsCount
      }
    });
    
  } catch (error) {
    console.error('Error in getProblemSolutions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve solutions"
    });
  }
};

// Get all problems
export const getProblem = async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate('createdBy', 'name email')
      .populate('bestSolution.submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
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

// Get specific problem
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
    
    const problem = await Problem.findOne({ problemId })
      .populate('createdBy', 'name email')
      .populate('bestSolution.submittedBy', 'name email')
      .populate('userSolutions.submittedBy', 'name email');
    
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
        success: false
      });
    }
    
    // Increment view count
    await Problem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    
    console.log('Problem found:', problem.problemId);
    
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

export default ProblemRouter;