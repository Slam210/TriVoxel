import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error.js";
import { createPost } from "../models/post.model.js";

export const create = async (req: any, res: any, next: NextFunction) => {
  // Check if the user is authenticated and an admin
  if (!req.user || req.user.roleId !== "admin") {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }

  // Extract fields from the request body and the file
  const { title, content, category, subtitle, cover_image } = req.body;

  // Validate required fields
  if (!title || !content) {
    return next(errorHandler(400, "Please provide all required fields"));
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
