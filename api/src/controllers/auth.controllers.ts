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
    if (
      !username ||
      !email ||
      !password ||
      username === "" ||
      email === "" ||
      password === ""
    ) {
      next(errorHandler(400, "All fields are required"));
    }
    await createUser(username, email, password);
    res.json({ message: "User created successfully!" });
  } catch (error) {
    next(error);
  }
  return undefined;
};
