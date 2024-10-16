import { NextFunction } from "express";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import {
  updateUserInDatabase,
  deleteUserInDatabase,
  getUsersFromDatabase,
  getUsersCount,
  getLastMonthUsersCount,
  getUserfromDatabase,
} from "../models/user.model.js";

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
};

export const deleteUser = async (req: any, res: any, next: NextFunction) => {
  if (
    Number(req.user.id) !== Number(req.params.userId) &&
    req.user.roleId !== "admin"
  ) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  try {
    const result = await deleteUserInDatabase(req.params.userId);
    if (!result) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const signout = (req: any, res: any, next: NextFunction) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {}
};

export const getUsers = async (req: any, res: any, next: NextFunction) => {
  if (req.user?.roleId !== "admin") {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }

  try {
    const startIndex: number = parseInt(req.query.startIndex as string) || 0;
    const limit: number = parseInt(req.query.limit as string) || 9;
    const sortDirection: "asc" | "desc" =
      req.query.sort === "asc" ? "asc" : "desc";

    const users = await getUsersFromDatabase(startIndex, limit, sortDirection);
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    const totalUsers = await getUsersCount();
    const lastMonthUsers = await getLastMonthUsersCount();

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: any, res: any, next: NextFunction) => {
  try {
    const user = await getUserfromDatabase(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
