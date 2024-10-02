import { Request, Response } from "express";
import { createUser } from "../models/user.model.js";

export const signup = async (
  req: Request,
  res: Response
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
      return res.status(400).json({ message: "All fields are required" });
    }
    await createUser(username, email, password);
    res.json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
  return undefined;
};
