import { Router } from "express";
import multer from "multer";
import { ProblemInput } from "../Components/ProblemComponents.js";

const ProblemRouter=Router();

ProblemRouter.post("/problemInput",ProblemInput);
export default ProblemRouter;