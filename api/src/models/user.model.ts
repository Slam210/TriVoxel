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
  path: path.join(__dirname, ".env"),
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
const createUser = async (
  username: string,
  email: string,
  password: string
): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const query = `
    INSERT INTO users (username, email, password, created_at, updated_at)
    VALUES ($1, $2, $3, DEFAULT, DEFAULT)  -- Use DEFAULT to insert current timestamps
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [username, email, hashedPassword]);
    console.log("User created:", res.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
  }
};
