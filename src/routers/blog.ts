import express from "express";

import authenticate from "../middlewares/authenticate";
import { createOrUpdateBlog } from "../controllers/blog";

const blogRouter = express.Router();

// routes
blogRouter.post("/create-blog", authenticate, createOrUpdateBlog);

export default blogRouter;
