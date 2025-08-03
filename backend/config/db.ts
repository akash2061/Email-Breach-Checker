import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "";
        const connection = await mongoose.connect(mongoURI);
        console.log(`Database connected to: ${connection.connection.host}`);
    } catch (error) {
        console.log("Database connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
