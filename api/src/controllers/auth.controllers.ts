import { Request, Response, NextFunction } from "express";
import { createUser } from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
      next(errorHandler(400, "All fields are required"));
      return;
    }

    // Try creating the user
    const userCreated: boolean = await createUser(username, email, password);

    // If user creation is successful, return 201 status
    if (userCreated) {
      return res.status(201).json({
        success: true,
        message: "User created successfully",
      });
    } else {
      // If the user already exists, return a 409 Conflict status
      next(errorHandler(200, "Username or email already exists."));
    }
  } catch (error) {
    // Handle any other errors
    next(error);
    return;
  }
};
