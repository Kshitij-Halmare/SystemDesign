import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const problemSchema = new mongoose.Schema({
    problemId: {
        type: String,
        unique: true,
        default: () => nanoid(10), // shorter: 10-char unique ID
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: mongoose.Schema.Types.Mixed, // Can be string or object (for rich text)
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: [true, 'Creator is required']
    },
    // Additional fields you might want
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
    solutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution' // If you have solutions
    }]
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
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

// Index for better query performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ createdAt: -1 });

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

    next();
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;