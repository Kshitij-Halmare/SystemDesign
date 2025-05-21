import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Provide name"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Provide description"],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, "Provide difficulty level"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Problem must be associated with a user"]
  }
}, { timestamps: true });

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
