import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import Blog from "../models/Blog";
import User from "../models/User";
import { AuthRequest } from "../middlewares/authenticate";

const createOrUpdateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract userId from authentication middleware
    const _req = req as AuthRequest;
    const userId = _req.userId;

    // Extract data from request body
    const { title, banner, content, tags, description, draft, blogId } =
      req.body;

    // Validation
    if (!title) {
      throw createHttpError(400, "Blog title is required.");
    }

    if (draft) {
      if (!description) {
        throw createHttpError(400, "Blog description is required for draft.");
      }
      if (!banner) {
        throw createHttpError(400, "Blog banner is required for draft.");
      }
      if (!content || content.blocks.length === 0) {
        throw createHttpError(400, "Blog content is required for draft.");
      }
      if (!tags || tags.length === 0) {
        throw createHttpError(400, "Tags are required for draft.");
      }
    }

    // Generate blog ID
    const generatedBlogId =
      blogId ||
      `${title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim()}-${uuidv4().substring(0, 8)}`;

    // Create or update blog
    let updatedBlog;
    if (blogId) {
      updatedBlog = await Blog.findOneAndUpdate(
        { blog_id: blogId },
        { title, description, banner, content, tags, draft: Boolean(draft) }
      );
    } else {
      const blog = new Blog({
        title,
        description,
        banner,
        content,
        tags,
        author: userId,
        blog_id: generatedBlogId,
        draft: Boolean(draft),
      });
      await blog.save();

      // Update user's post count
      if (!draft) {
        await User.findOneAndUpdate(
          { _id: userId },
          {
            $inc: { "account_info.total_posts": 1 },
            $push: { blogs: blog._id },
          }
        );
      }
    }

    // Send response
    res.json({ blogId: blogId || updatedBlog?.blog_id });
  } catch (error: any) {
    // Pass error to error handling middleware
    next(error);
  }
};

export { createOrUpdateBlog };