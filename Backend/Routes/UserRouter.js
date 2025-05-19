import {Router} from "express";
import dotenv from "dotenv";
import { Register } from "../Components/UserRouter";
const userRouter=Router();
userRouter.post("/register",Register);