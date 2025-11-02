import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Define sub-schemas for better structure
const nodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, default: 'default' },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    data: {
        label: { type: String, required: true }
    }
}, { _id: false });

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, default: 'default' }
}, { _id: false });

const solutionWorkspaceSchema = new mongoose.Schema({
    nodes: [nodeSchema],
    edges: [edgeSchema],
    notes: { type: String, default: '' }
}, { _id: false });

// Individual solution schema for storing multiple solutions per user
// NOTE: Users can submit MULTIPLE solutions to improve their answers
const individualSolutionSchema = new mongoose.Schema({
    solutionId: {
        type: String,
        default: () => nanoid(10), // Removed unique constraint to allow multiple per user
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Submitter is required']
    },
    solutionWorkspace: {
        type: solutionWorkspaceSchema,
        default: null
    },
    writtenSolution: {
        type: String,
        trim: true,
        maxlength: [10000, 'Written solution cannot exceed 10000 characters'],
        default: ''
    },
    votes: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const problemSchema = new mongoose.Schema({
    problemId: {
        type: String,
        unique: true,
        default: () => nanoid(10),
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Description is required']
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Difficulty must be easy, medium, or hard'
        },
        lowercase: true
    },
    hints: [{
        type: String,
        trim: true,
        maxlength: [500, 'Each hint cannot exceed 500 characters']
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, 'Each tag cannot exceed 50 characters']
    }],
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        originalName: { type: String, required: true },
        size: { type: Number, required: true },
        format: { type: String, required: true }
    }],
    
    // BEST SOLUTION: Only ONE solution marked as best by problem creator
    // This is typically the creator's original solution or a highly-voted community solution
    bestSolution: {
        type: individualSolutionSchema,
        default: null
    },
    
    // USER SOLUTIONS: Array of ALL user-submitted solutions
    // Users can submit MULTIPLE solutions to the same problem
    // This allows users to iterate and improve their answers
    userSolutions: [individualSolutionSchema],
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    reviewed: { type: Boolean, default: false },
    solutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
problemSchema.virtual('imageCount').get(function () {
    return this.images ? this.images.length : 0;
});

problemSchema.virtual('hintCount').get(function () {
    return this.hints ? this.hints.length : 0;
});

problemSchema.virtual('tagCount').get(function () {
    return this.tags ? this.tags.length : 0;
});

problemSchema.virtual('totalSolutionsCount').get(function () {
    return this.userSolutions ? this.userSolutions.length : 0;
});

problemSchema.virtual('hasBestSolution').get(function () {
    return this.bestSolution !== null && this.bestSolution !== undefined;
});

problemSchema.virtual('hasSolutions').get(function () {
    return (this.userSolutions && this.userSolutions.length > 0) || this.hasBestSolution;
});

// Indexes for better query performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ createdAt: -1 });
problemSchema.index({ reviewed: 1 });
problemSchema.index({ 'userSolutions.submittedBy': 1 });
problemSchema.index({ 'userSolutions.votes': -1 });

// Pre-save middleware for validation
problemSchema.pre('save', function (next) {
    // Validate hints array length
    if (this.hints && this.hints.length > 3) {
        return next(new Error('Maximum 3 hints allowed'));
    }

    // Validate tags array length
    if (this.tags && this.tags.length > 5) {
        return next(new Error('Maximum 5 tags allowed'));
    }

    // Validate images array length
    if (this.images && this.images.length > 5) {
        return next(new Error('Maximum 5 images allowed'));
    }

    // Validate and structure best solution
    if (this.bestSolution) {
        this.bestSolution = validateAndStructureSolution(this.bestSolution);
    }

    // Validate and structure user solutions
    if (this.userSolutions && this.userSolutions.length > 0) {
        this.userSolutions = this.userSolutions.map(solution => 
            validateAndStructureSolution(solution)
        );
    }

    next();
});

// Helper function to validate and structure solution
function validateAndStructureSolution(solution) {
    if (!solution) return solution;

    // If solutionWorkspace is a string, parse it
    if (solution.solutionWorkspace && typeof solution.solutionWorkspace === 'string') {
        try {
            solution.solutionWorkspace = JSON.parse(solution.solutionWorkspace);
        } catch (error) {
            throw new Error('Invalid solution workspace format');
        }
    }
    
    // Ensure proper structure for workspace
    if (solution.solutionWorkspace) {
        if (!solution.solutionWorkspace.nodes) {
            solution.solutionWorkspace.nodes = [];
        }
        if (!solution.solutionWorkspace.edges) {
            solution.solutionWorkspace.edges = [];
        }
        if (!solution.solutionWorkspace.notes) {
            solution.solutionWorkspace.notes = '';
        }

        // Validate node structure
        solution.solutionWorkspace.nodes.forEach((node, index) => {
            if (!node.id) {
                node.id = `node_${Date.now()}_${index}`;
            }
            if (!node.position) {
                node.position = { x: 100, y: 100 };
            }
            if (!node.data) {
                node.data = { label: node.label || 'Component' };
            }
            if (!node.type) {
                node.type = 'default';
            }
        });

        // Validate edge structure
        solution.solutionWorkspace.edges.forEach((edge, index) => {
            if (!edge.id) {
                edge.id = `edge_${Date.now()}_${index}`;
            }
            if (!edge.type) {
                edge.type = 'default';
            }
        });
    }

    // Validate that at least one form of solution exists
    const hasWorkspace = solution.solutionWorkspace && 
        solution.solutionWorkspace.nodes && 
        solution.solutionWorkspace.nodes.length > 0;
    
    const hasWrittenSolution = solution.writtenSolution && 
        solution.writtenSolution.trim().length > 0;
    
    if (!hasWorkspace && !hasWrittenSolution) {
        throw new Error('At least one form of solution (workspace or written) is required');
    }

    return solution;
}

// Instance method to set best solution
problemSchema.methods.setBestSolution = function(solutionId) {
    const solution = this.userSolutions.id(solutionId);
    if (!solution) {
        throw new Error('Solution not found');
    }
    this.bestSolution = solution.toObject();
    return this.save();
};

// Instance method to add a user solution (allows multiple per user)
problemSchema.methods.addUserSolution = function(solutionData) {
    this.userSolutions.push(solutionData);
    return this.save();
};

// Instance method to remove a user solution
problemSchema.methods.removeUserSolution = function(solutionId) {
    this.userSolutions.pull(solutionId);
    return this.save();
};

// Instance method to upvote a solution
problemSchema.methods.upvoteSolution = function(solutionId) {
    const solution = this.userSolutions.id(solutionId);
    if (solution) {
        solution.votes += 1;
        return this.save();
    }
    throw new Error('Solution not found');
};

// Instance method to get all solutions by a specific user
problemSchema.methods.getUserSolutions = function(userId) {
    return this.userSolutions.filter(sol => {
        const solUserId = sol.submittedBy?._id?.toString() || sol.submittedBy?.toString();
        return solUserId === userId.toString();
    });
};

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;