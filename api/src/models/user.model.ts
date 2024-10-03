import pg from "pg";
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

// PostgreSQL connection pool configuration
const { Pool } = pg;
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
): Promise<boolean> => {
  try {
    // Check if the username or email already exists
    const existingUserQuery = `
      SELECT * FROM users WHERE username = $1 OR email = $2;
    `;
    const existingUser = await pool.query(existingUserQuery, [username, email]);

    if (existingUser.rows.length > 0) {
      console.log("Error: Username or Email already exists.");
      return false; // Indicate that user creation failed due to a duplicate
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertUserQuery = `
      INSERT INTO users (username, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, DEFAULT, DEFAULT)
      RETURNING *;
    `;
    await pool.query(insertUserQuery, [username, email, hashedPassword]);

    console.log("User created:", username);
    return true; // User creation successful
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error("User creation failed due to a database error");
  }
};

// Function to find a user by username
export const findUser = async (email: string = ""): Promise<any | null> => {
  try {
    const query = `
      SELECT * FROM users WHERE email = $1;
    `;

    // Execute the query with provided parameters
    const result = await pool.query(query, [email]);

    // Check if any user is found
    if (result.rows.length > 0) {
      return result.rows[0]; // Return the first matching user
    }

    return null; // Return null if no user found
  } catch (error) {
    console.error("Error finding user:", error);
    throw new Error("Database query failed");
  }
};
