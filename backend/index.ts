import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import authRoutes from "./routes/auth";
import { errorHandler } from './middleware/globalErrorhandling';

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

connectDB();

app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:5000');
});