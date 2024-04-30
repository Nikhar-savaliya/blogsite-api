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
    const isMatch = verifyPassword(password, user.personal_info.password);
    if (!isMatch) {
      return next(createHttpError(400, "email or password incorrect"));
    }
  } catch (error) {
    return next(createHttpError(500, "failed to compare password" + error));
  }
  try {
    // token generation JWT
    const token = generateJWtoken(user._id);

    // response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "error while signing jwt token"));
  }
};

export { createUser, loginUser };
