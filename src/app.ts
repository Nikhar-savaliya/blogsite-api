import express, { NextFunction, Request, Response } from "express";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routers/user";
import blogRouter from "./routers/blog";

const app = express();
app.use(express.json());

// routes
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  return res.json({ message: "hello world" });
});

app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
