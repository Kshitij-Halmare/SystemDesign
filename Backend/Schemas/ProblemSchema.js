import mongoose from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const ProblemSchema = new mongoose.Schema({
    problemId: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: [true, "Provide title"],
        trim: true,
        maxlength: 200
    },
    description: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Provide problem description"]
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: [true, "Provide difficulty level"]
    },
    hints: {
        type: [String], // supports multiple hints
        default: []
    },
    tags: {
        type: [String], // optional tags for filtering
        default: [],
        index: true
    },
    images: {
        type: [String], // optional image URLs
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Problem must be associated with a user"]
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
    }
}, {
    timestamps: true
});

ProblemSchema.plugin(AutoIncrement, { inc_field: 'problemId' });

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
