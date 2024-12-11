import { NextFunction } from "express";
import { errorHandler } from "../utils/error.js";
import {
  createModelResume,
  findResumesByUserId,
} from "../models/resume.model.js";

export const create = async (req: any, res: any, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.user) {
    return next(
      errorHandler(403, "You are not authenticated to create a post")
    );
  }

  const { userId, layers, colors } = req.body;
  console.log(userId, layers, colors);

  if (!userId || !layers || !colors) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const resume = await createModelResume(userId, layers, colors);
    res.status(201).json(resume);
  } catch (error) {
    console.error("Error in /resume endpoint:", error);
    res.status(500).json({ error: "Failed to create resume" });
  }
};

export const getByUserId = async (req: any, res: any, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.user) {
    return next(errorHandler(403, "You are not authenticated to view resumes"));
  }

  const { userId } = req.params; // Get userId from the route parameter

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const resumes = await findResumesByUserId(userId);

    if (resumes.length === 0) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user" });
    }

    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error in /resumes/user/:userId endpoint:", error);
    res.status(500).json({ error: "Failed to retrieve resumes" });
  }
};
