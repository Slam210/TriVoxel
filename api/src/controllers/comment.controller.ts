import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createUserComment,
  findPostComments,
  findCommentById,
  updateCommentLikes,
  updateCommentContent,
} from "../models/comment.model.js";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  override: true,
  path: path.join(__dirname, "../../.env"),
});

export const createComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, postId, userId } = req.body;

    if (userId !== req.user.id) {
      return next(
        errorHandler(403, "You are not allowed to create this comment")
      );
    }

    const newComment = await createUserComment(content, postId, userId);
    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await findPostComments(req.params.postId);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// Like or unlike a comment
export const likeComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // Find the comment by ID
    const comment = await findCommentById(commentId);

    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    // Check if user has already liked the comment
    const userIndex = comment.likes.indexOf(String(userId));

    if (userIndex === -1) {
      // If the user hasn't liked it, increment the likes and add the user
      comment.likes.push(userId);
      comment.number_of_likes += 1;
    } else {
      // If the user has liked it, decrement the likes and remove the user
      comment.likes.splice(userIndex, 1);
      comment.number_of_likes -= 1;
    }

    // Update the comment in the database
    const updatedComment = await updateCommentLikes(
      commentId,
      comment.likes,
      comment.number_of_likes
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

// Edit a comment
export const editComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // Find the comment by ID
    const comment = await findCommentById(commentId);

    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    // Check if the user is the owner of the comment or an admin
    if (comment.user_id !== userId && req.user.roleId !== "admin") {
      return next(
        errorHandler(403, "You are not allowed to edit this comment")
      );
    }

    // Update the comment content
    const updatedComment = await updateCommentContent(
      commentId,
      req.body.content
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};
