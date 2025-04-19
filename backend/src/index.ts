import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from 'mongoose';
import userRoutes from './routes/users'; 
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';
import path from "path";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

console.log(process.env.FRONTEND_URL);
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join("../../frontend/dist")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/test", async(req: Request,res: Response)=>{
    res.json({ message: "Hello from express endpoint!" });
});

app.listen(7000, ()=>{
    console.log("Server is running on localhost:7000");
});
