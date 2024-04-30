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

const latestBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { page } = req.body;
    let maxLimit = 3;

    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title description banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    res.status(200).json({ blogs });
  } catch (error: any) {
    // Pass error to error handling middleware
    next(createHttpError(500, error.message));
  }
};

const countAllPublishedBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    res.status(200).json({ totalBlogsCount: count });
  } catch (error: any) {
    // Pass error to error handling middleware
    next(createHttpError(500, error.message));
  }
};

const trendingBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_like": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    res.status(200).json({ blogs });
  } catch (error: any) {
    // Pass error to error handling middleware
    next(createHttpError(500, error.message));
  }
};

const searchBlogByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { tag, page, query, author, limit, eliminateBlog } = req.body;
    let findQuery: any;

    if (tag) {
      findQuery = {
        tags: tag,
        draft: false,
        blog_id: { $ne: eliminateBlog },
      };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    let maxLimit = limit || 3;

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title description banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    res.status(200).json({ blogs });
  } catch (error: any) {
    // Pass error to error handling middleware
    next(createHttpError(500, error.message));
  }
};

export {
  createOrUpdateBlog,
  latestBlog,
  countAllPublishedBlogs,
  trendingBlogs,
  searchBlogByQuery,
};
