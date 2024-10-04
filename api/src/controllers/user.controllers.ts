import { NextFunction } from "express";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import { updateUserInDatabase } from "../models/user.model.js";

export const test = (req: any, res: any) => {
  res.json({ message: "API is working" });
};

export const updateUser = async (req: any, res: any, next: NextFunction) => {
  if (Number(req.user.id) !== Number(req.params.userId)) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
    try {
      const updatedUser = await updateUserInDatabase(req.params.userId, {
        username: req.body.username,
        email: req.body.email,
        profilePicture: req.body.profilePicture,
        password: req.body.password,
      });

      if (!updatedUser) {
        return next(errorHandler(404, "User not found"));
      }

      const { password, ...rest } = updatedUser;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  }
};
