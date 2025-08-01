import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    statusCode?: number;
    errors?: Record<string, { message: string }>;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        const errors: Record<string, string> = {};
        for (let key in err.errors) {
            errors[key] = err.errors[key].message;
        }
        message = JSON.stringify(errors);
    }

    res.status(statusCode).json({
        status: "error",
        message,
    });
};