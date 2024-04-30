import express from "express";

import { createUser, loginUser } from "../controllers/user";
import createUserMiddleware from "../middlewares/createUserMiddlware";

const userRouter = express.Router();

// routes
userRouter.post("/register", createUserMiddleware, createUser);
userRouter.post("/login", loginUser);

export default userRouter;
