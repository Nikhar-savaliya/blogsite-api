import { Document, Schema } from "mongoose";
import User from "./user";

interface Activity {
  total_likes: number;
  total_comments: number;
  total_reads: number;
  total_parent_comments: number;
}

interface Blog extends Document {
  blog_id: string;
  title: string;
  banner?: string;
  description?: string;
  content?: any[];
  tags?: string[];
  author: Schema.Types.ObjectId | User;
  activity: Activity;
  comments?: Schema.Types.ObjectId[];
  draft?: boolean;
  publishedAt: Date;
}

export default Blog;
