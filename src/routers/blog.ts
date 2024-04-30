import express from "express";

import authenticate from "../middlewares/authenticate";
import {
  countAllPublishedBlogs,
  createOrUpdateBlog,
  latestBlog,
} from "../controllers/blog";

const blogRouter = express.Router();

// routes
blogRouter.post("/create-blog", authenticate, createOrUpdateBlog);
blogRouter.post("/latest-blogs", latestBlog);
blogRouter.post("/all-publish-blogs-count", countAllPublishedBlogs);

export default blogRouter;
