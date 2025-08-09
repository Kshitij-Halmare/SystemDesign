import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Define sub-schemas for better structure
const nodeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'default'
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    data: {
        label: { type: String, required: true }
    }
}, { _id: false });

const edgeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'default'
    }
}, { _id: false });

const solutionWorkspaceSchema = new mongoose.Schema({
    nodes: [nodeSchema],
    edges: [edgeSchema],
    notes: {
        type: String,
        default: ''
    }
}, { _id: false });

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
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        format: {
            type: String,
            required: true
        }
    }],
    // FIXED: Better structure for solution workspace
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
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    reviewed: {
        type: Boolean,
        default: false
    },
    solutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for image count
problemSchema.virtual('imageCount').get(function () {
    return this.images ? this.images.length : 0;
});

// Virtual for hint count
problemSchema.virtual('hintCount').get(function () {
    return this.hints ? this.hints.length : 0;
});

// Virtual for tag count
problemSchema.virtual('tagCount').get(function () {
    return this.tags ? this.tags.length : 0;
});

// FIXED: Better virtual to check if solution is provided
problemSchema.virtual('hasSolution').get(function () {
    const hasWorkspace = this.solutionWorkspace && 
        this.solutionWorkspace.nodes && 
        this.solutionWorkspace.nodes.length > 0;
    
    const hasWrittenSolution = this.writtenSolution && this.writtenSolution.trim().length > 0;
    
    return hasWorkspace || hasWrittenSolution;
});

// Index for better query performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ createdAt: -1 });
problemSchema.index({ reviewed: 1 });

// FIXED: Pre-save middleware for validation
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

    // Handle solutionWorkspace validation and structure
    if (this.solutionWorkspace) {
        // If it's a string, try to parse it
        if (typeof this.solutionWorkspace === 'string') {
            try {
                this.solutionWorkspace = JSON.parse(this.solutionWorkspace);
            } catch (error) {
                return next(new Error('Invalid solution workspace format'));
            }
        }
        
        // Ensure proper structure
        if (!this.solutionWorkspace.nodes) {
            this.solutionWorkspace.nodes = [];
        }
        if (!this.solutionWorkspace.edges) {
            this.solutionWorkspace.edges = [];
        }
        if (!this.solutionWorkspace.notes) {
            this.solutionWorkspace.notes = '';
        }

        // Validate node structure
        this.solutionWorkspace.nodes.forEach((node, index) => {
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
        this.solutionWorkspace.edges.forEach((edge, index) => {
            if (!edge.id) {
                edge.id = `edge_${Date.now()}_${index}`;
            }
            if (!edge.type) {
                edge.type = 'default';
            }
        });
    }

    // FIXED: Ensure at least one form of solution is provided
    const hasWorkspace = this.solutionWorkspace && 
        this.solutionWorkspace.nodes && 
        this.solutionWorkspace.nodes.length > 0;
    
    const hasWrittenSolution = this.writtenSolution && this.writtenSolution.trim().length > 0;
    
    if (!hasWorkspace && !hasWrittenSolution) {
        return next(new Error('At least one form of solution (workspace or written) is required'));
    }

    next();
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;