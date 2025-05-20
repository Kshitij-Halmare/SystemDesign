import { Router } from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Register } from "../Components/UserComponents.js";

dotenv.config();

const userRouter = Router();

// Define multer storage (memory storage for buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.post("/register", upload.single('image'), Register);

export default userRouter;
