import { Request, Response, NextFunction } from "express";
import axios from "axios";

const checkEmailBreach = async (email: string): Promise<any> => {
    try {
        const response = await axios.get(`https://api.xposedornot.com/v1/breach-analytics?email=${email}`, {
            headers: {
                "User-Agent": "Email-Breach-Checker",
                "Accept": "application/json"
            },
            timeout: 5000
        });
        return response.data;
    } catch (error: any) {
        console.error('API Error:', error.message);
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            throw new Error("No response from breach checking service");
        } else {
            throw new Error("Error setting up breach check request");
        }
    }
}

export const emailBreach = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        try {
            const breachData = await checkEmailBreach(email);

            return res.status(200).json({
                success: true,
                email: email,
                data: breachData,
                checkedAt: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('Breach check failed:', error.message);

            return res.status(503).json({
                success: false,
                message: "Breach checking service is currently unavailable",
                error: error.message,
                email: email
            });
        }
    } catch (error) {
        next(error);
    }
}
