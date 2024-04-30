import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

interface ValidateUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

const createUserMiddleware = (
  req: ValidateUserRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  try {
    // Validation: Check if all required fields are provided
    if (!name || !email || !password) {
      throw createHttpError(400, "All fields are required");
    }

    // Validation: Check email format
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw createHttpError(400, "Invalid email format");
    }

    // Validation: Check minimum password length
    if (password.length < 6) {
      throw createHttpError(400, "Password must be at least 6 characters long");
    }

    // Proceed to the next middleware if validation passes
    next();
  } catch (error: any) {
    console.log("Error in create user middlware: " + error.message);

    // Pass the error to the error handling middleware
    next(createHttpError(500, error.message));
  }
};

export default createUserMiddleware;
