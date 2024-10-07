import { Request, Response, NextFunction } from "express";
import { createUser, findUser } from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  override: true,
  path: path.join(__dirname, "../../.env"),
});

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

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    // Use the findUser function to check if the user exists
    const validUser = await findUser(email);

    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Here we assume validUser is an object containing the user data
    const validPassword = bcrypt.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }

    // Generate a token
    const token = jwt.sign(
      { id: validUser.id, roleId: validUser.roleId },
      process.env.JWT_SECRET as string
    );

    // Exclude the password from the response
    const { password: pass, ...rest } = validUser;

    // Send the response with the token
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    // Check if user exists
    const user = await findUser(email);

    if (user) {
      // If user exists, generate JWT token
      const token = jwt.sign(
        { id: user.id, roleId: user.roleId },
        process.env.JWT_SECRET as string
      );
      const { password, ...rest } = user;

      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      // If user does not exist, generate random password
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      // Create a new user
      const newUserCreated = await createUser(
        name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        hashedPassword
      );

      if (newUserCreated) {
        // Fetch the new user after successful creation
        const newUser = await findUser(email);
        const token = jwt.sign(
          { id: newUser.id, roleId: newUser.roleId },
          process.env.JWT_SECRET as string
        );
        const { password, ...rest } = newUser;

        res
          .status(200)
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .json(rest);
      } else {
        res.status(400).json({ message: "User creation failed" });
      }
    }
  } catch (error) {
    next(error);
  }
};
