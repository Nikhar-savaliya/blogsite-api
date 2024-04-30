import { sign } from "jsonwebtoken";

import { config } from "../config/config";
import { ObjectId } from "mongoose";

const generateJWtoken = (_id: ObjectId) => {
  const token = sign({ sub: _id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });
  return token;
};

export default generateJWtoken;
