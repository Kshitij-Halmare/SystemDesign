import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());
const PORT=process.env.PORT || 8000;
// app.listen(PORT,()=>{
//     console.log(`server listening on port ${PORT}`);
// })
const MONGODB_URL=process.env.MONGODB_URL;
if(!MONGODB_URL){
    console.log("url not found");
}
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit if MongoDB connection fails
  });