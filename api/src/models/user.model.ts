import express from "express";
import path from "path";
import { fileURLToPath } from "url"; // Simulate __dirname in ES modules
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Destructure Pool from the pg module
const { Pool } = pg;

// Initialize Express
const app = express();

// Load environment variables
dotenv.config({
  override: true,
  path: path.join(__dirname, "../.env"),
});

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT ? Number(process.env.PORT) : undefined,
});

// Function to create a new user
export const createUser = async (
  username: string,
  email: string,
  password: string
): Promise<void> => {
  try {
    // Check if the username or email already exists
    const existingUserQuery = `
      SELECT * FROM users WHERE username = $1 OR email = $2;
    `;
    const existingUser = await pool.query(existingUserQuery, [username, email]);

    if (existingUser.rows.length > 0) {
      console.log("Error: Username or Email already exists.");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertUserQuery = `
      INSERT INTO users (username, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, DEFAULT, DEFAULT)
      RETURNING *;
    `;
    const res = await pool.query(insertUserQuery, [
      username,
      email,
      hashedPassword,
    ]);

    console.log("User created:", res.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
  }
};
