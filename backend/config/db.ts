import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect("mongodb://localhost:27017/EBC");
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
