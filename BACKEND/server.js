import express from "express";
import cors from "cors";
import dotnv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/post.routes.js"
import userRoutes from "./routes/user.routes.js"

dotnv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"))

const start = async()=>{

    const connetDB= await mongoose.connect("mongodb+srv://kmrprem0777_db_user:SKqj6kI6bBkXLrcm@linkedinclone.pv8uguh.mongodb.net/");


    
    app.listen(9090,()=>{
        console.log("server is running on port 9090");
    })
}

start();