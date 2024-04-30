import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import userModel from "../models/User";
import User from "../types/user";
import { encryptPassword, verifyPassword } from "../utils/password";
import generateUniqueUsername from "../utils/generateUniqueUsername";
import generateJWtoken from "../utils/generateJWToken";
import formatDatatoSend from "../utils/responseUserDataFormat";

/**
 *
 * @create new user controller
 *
 */

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    // generate unique username
    let username = await generateUniqueUsername(email);

    // Create a new user
    const newUser: User = new userModel({
      personal_info: {
        fullname: name,
        username,
        email,
        password: hashedPassword,
      },
    });
    await newUser.save();

    // log newly created user to console
    console.log(formatDatatoSend(newUser));

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

/**
 *
 * @login new user controller
 *
 */

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Validation: Check if email and password are provided
    if (!email || !password) {
      throw createHttpError(400, "All fields are required");
    }

    // Find user by email
    const user: User | null = await userModel.findOne({
      "personal_info.email": email,
    });

    // Check if user exists
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    // Verify password
    const isMatch: boolean = await verifyPassword(
      password,
      user.personal_info.password
    );
    if (!isMatch) {
      throw createHttpError(400, "Email or password incorrect");
    }

    // Generate JWT token
    const token: string = generateJWtoken(user._id);

    // Send response with JWT token
    res.status(200).json({ accessToken: token });
  } catch (error: any) {
    // Handle errors
    return next(createHttpError(500, "Error during login: " + error.message));
  }
};

export { createUser, loginUser };
