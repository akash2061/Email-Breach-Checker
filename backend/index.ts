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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});