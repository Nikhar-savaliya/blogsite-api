import express from "express";

import authenticate from "../middlewares/authenticate";
import {
  countAllPublishedBlogs,
  countSearchBlog,
  createOrUpdateBlog,
  latestBlog,
  searchBlogByQuery,
  trendingBlogs,
} from "../controllers/blog";

const blogRouter = express.Router();

// routes
blogRouter.post("/create-blog", authenticate, createOrUpdateBlog);
blogRouter.post("/latest-blogs", latestBlog);
blogRouter.get("/all-publish-blogs-count", countAllPublishedBlogs);
blogRouter.get("/trending-blogs", trendingBlogs);
blogRouter.post("/search-blog", searchBlogByQuery);
blogRouter.post("/search-blog-count", countSearchBlog);

export default blogRouter;
