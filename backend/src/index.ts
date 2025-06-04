import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import * as path from "path";
import { v2 as cloudinary } from "cloudinary";

import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import myHotelRoutes from './routes/my-hotels';
import hotelRoutes from './routes/hotels';
import bookingRoutes from './routes/bookings';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels",hotelRoutes)
app.use("/api/my-bookings",bookingRoutes)
app.listen(7000, () => {
  console.log("Server is running on http://localhost:7000");
});
