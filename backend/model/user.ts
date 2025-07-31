import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name should be at least 3 characters long"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        validate: {
            validator: function (value: string) {
                return validator.isAlpha(value, "en-US", { ignore: " " });
            },
            message: "Name should only contain alphabets and spaces",
        },
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: function (value: string) {
                return validator.isEmail(value);
            },
            message: "Please enter a valid email address",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        validate: {
            validator: function (value: string) {
                return validator.isStrongPassword(value, {
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                });
            },
            message: "Password must include at least one uppercase, one lowercase letter, one number, and one symbol",
        },
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
