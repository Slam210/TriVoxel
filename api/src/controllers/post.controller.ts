import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error.js";
import {
  createPost,
  fetchPosts,
  countTotalPosts,
  countLastMonthPosts,
  fetchUserPosts,
} from "../models/post.model.js";

export const create = async (req: any, res: any, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.user) {
    return next(
      errorHandler(403, "You are not authenticated to create a post")
    );
  }

  const { title, content, category, subtitle, cover_image } = req.body;

  // Validate required fields
  if (!title || !content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  // Role-based access control
  const { roleId } = req.user;

  // Determine allowed categories based on role
  const allowedCategories: Record<string, string[]> = {
    admin: ["tutorials", "blogs", "resume"],
    contributor: ["tutorials", "blogs", "resume"],
    verifieduser: ["blogs", "resume"],
    user: ["resume"],
  };
  // Check if the user's role is allowed to create the specified category
  if (!allowedCategories[roleId]?.includes(category)) {
    return next(
      errorHandler(403, "You are not allowed to create a post in this category")
    );
  }

  // Generate slug from the title
  const slug = generateSlug(title);

  try {
    // Call the createPost function to insert the post into PostgreSQL
    const success = await createPost(
      req.user.id,
      title,
      content,
      slug,
      category,
      subtitle,
      cover_image
    );

    // Check if the post creation was successful
    if (success) {
      res
        .status(201)
        .json({ message: "Post created successfully", slug: slug });
    } else {
      return next(
        errorHandler(409, "Post with the same title or slug already exists")
      );
    }
  } catch (error) {
    next(error);
  }
};

// Utility function to generate slug
const generateSlug = (title: string): string => {
  return title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
};

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startIndex = parseInt(req.query.startIndex as string) || 0;
    const limit = parseInt(req.query.limit as string) || 9;
    const sortDirection = req.query.order === "asc" ? "ASC" : "DESC";

    const filters: string[] = [];
    const queryParams: any[] = [];

    if (req.query.userId) {
      filters.push(`"userId" = $${filters.length + 1}`);
      queryParams.push(req.query.userId);
    }

    if (req.query.category) {
      filters.push(`category = $${filters.length + 1}`);
      queryParams.push(req.query.category);
    }

    if (req.query.slug) {
      filters.push(`slug = $${filters.length + 1}`);
      queryParams.push(req.query.slug);
    }

    if (req.query.postId) {
      filters.push(`id = $${filters.length + 1}`);
      queryParams.push(req.query.postId);
    }

    if (req.query.searchTerm) {
      filters.push(
        `(title ILIKE $${filters.length + 1} OR content ILIKE $${
          filters.length + 2
        })`
      );
      queryParams.push(
        `%${req.query.searchTerm}%`,
        `%${req.query.searchTerm}%`
      );
    }

    // Fetch posts with filters, pagination, and sorting
    const posts = await fetchPosts(
      startIndex,
      limit,
      sortDirection,
      filters,
      queryParams
    );

    // Fetch total number of posts
    const totalPosts = await countTotalPosts();

    // Calculate date for posts from the last month
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    // Fetch number of posts created in the last month
    const lastMonthPosts = await countLastMonthPosts(oneMonthAgo);

    // Return the results
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    next(error);
  }
};

export const getUserPosts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return next(errorHandler(403, "You are not authenticated to view posts"));
    }

    const userId = req.user.id as string;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(userId);

    const startIndex = parseInt(req.query.startIndex as string) || 0;
    const limit = parseInt(req.query.limit as string) || 9;
    const sortDirection = req.query.order === "asc" ? "ASC" : "DESC";

    // Role-based access control
    const { roleId } = req.user;

    // Define allowed categories for each role
    const allowedCategories: Record<string, string[]> = {
      admin: ["tutorials", "blogs", "resume"],
      contributor: ["tutorials", "blogs", "resume"],
      verifieduser: ["blogs", "resume"],
      user: ["resume"],
    };

    // Get the categories the user's role is allowed to view
    const allowedCategoriesForRole = allowedCategories[roleId];

    if (!allowedCategoriesForRole || allowedCategoriesForRole.length === 0) {
      return next(errorHandler(403, "You are not allowed to view any posts"));
    }

    // Fetch posts for the specific user, filtered by the allowed categories for their role
    const posts = await fetchUserPosts(
      userId,
      startIndex,
      limit,
      sortDirection,
      allowedCategoriesForRole
    );

    // Fetch total number of posts (if needed)
    const totalPosts = posts.length;

    // Return the results
    res.status(200).json({
      posts,
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    next(error);
  }
};
