import express from "express";

import authenticate from "../middlewares/authenticate";
import { createOrUpdateBlog, latestBlog } from "../controllers/blog";

const blogRouter = express.Router();

// routes
blogRouter.post("/create-blog", authenticate, createOrUpdateBlog);
blogRouter.post("/latest-blogs", latestBlog);

export default blogRouter;
