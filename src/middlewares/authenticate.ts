import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const auth_token_header = req.header("Authorization");
  if (!auth_token_header || !auth_token_header.startsWith("Bearer ")) {
    return next(
      createHttpError(401, "Authorization header is missing or invalid")
    );
  }
  try {
    const parsedToken = auth_token_header.split(" ")[1];
    const decodedToken = jwt.verify(parsedToken, config.jwtSecret);
    // console.log(decoded);
    const _req = req as AuthRequest;
    _req.userId = decodedToken.sub as string;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return next(createHttpError(401, "Invalid token."));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(createHttpError(401, "Token expired."));
    } else {
      return next(createHttpError(500, "Internal server error."));
    }
  }
};

export default authenticate;
