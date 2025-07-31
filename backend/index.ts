import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import authRoutes from "./routes/auth";
import { errorHandler } from './middleware/globalErrorhandling';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route (should come first)
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// API Routes
app.use("/api/auth", authRoutes);

// Error handling middleware (MUST be last)
app.use(errorHandler);

// MongoDB connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});