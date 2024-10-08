import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error.js";
import { createPost } from "../models/post.model.js";

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
