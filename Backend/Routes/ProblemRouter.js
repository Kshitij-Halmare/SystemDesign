import { Router } from "express";
import multer from "multer";
import { ProblemInput } from "../Components/ProblemComponents.js";
import { verifyToken } from "../Middleware/auth.js";

const ProblemRouter=Router();

ProblemRouter.post("/problemInput",verifyToken,ProblemInput);
export default ProblemRouter;