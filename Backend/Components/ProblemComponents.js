import { Router } from "express";
import Problem from "../Schemas/ProblemSchema.js";

const ProblemRouter = Router();

export async function ProblemInput(req, res) {
    try {
        const { title, description, difficulty, hints } = req.body;
        console.log({ title, description, difficulty, hints }, req.user)
        if (!title || !description || !difficulty) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const problem = new Problem({
            title,
            description: JSON.parse(description),
            difficulty,
            hints,
            createdBy: req.user.userId,
        });


        await problem.save();

        return res.status(201).json({ message: "Problem submitted successfully", problem });
    } catch (error) {
        console.error("Error saving problem:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

