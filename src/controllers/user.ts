import { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { sign } from "jsonwebtoken";

import userModel from "../models/user";
import { config } from "../config/config";
import { User } from "../types/user";
import { encryptPassword, verifyPassword } from "../utils/password";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(
        400,
        "user already exists with this email."
      );
      return next(error);
    }

    // Encrypt the password before saving it to the database
    const hashedPassword = await encryptPassword(password);

    // Create a new user
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please login to continue.",
    });
  } catch (error: any) {
    // Handle database or other internal errors
    return next(
      createHttpError(500, "Error in creating user: " + error.message)
    );
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createHttpError(400, "all fields are required"));
  }
  let user: User | null;
  try {
    // finding user
    user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
  } catch (error) {
    return next(createHttpError(500, "error finding user from database"));
  }

  try {
    // comparing password
    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return next(createHttpError(400, "email or password incorrect"));
    }
  } catch (error) {
    return next(createHttpError(500, "failed to compare password" + error));
  }
  try {
    // token generation JWT
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    // response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "error while signing jwt token"));
  }
};

export { createUser, loginUser };
