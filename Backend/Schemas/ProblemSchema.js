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
        required: [true, "Provide name"],
        trim: true
    },
    description: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: [true, "Provide difficulty level"]
    },
    hints: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Problem must be associated with a user"]
    }
}, { timestamps: true });

ProblemSchema.plugin(AutoIncrement, { inc_field: 'problemId' });

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
