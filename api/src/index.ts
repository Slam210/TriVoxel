import express from "express";
import authRoutes from "./routes/auth.route.js";
import path from "path";
import { fileURLToPath } from "url"; // Simulate __dirname in ES modules
import pg from "pg";
import dotenv from "dotenv";

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
  port: process.env.PORT ? Number(process.env.PORT) : undefined, // Convert to number
});

// Async function to connect and query the database
async function getCurrentUser() {
  try {
    const { rows } = await pool.query("SELECT current_user");
    const currentUser = rows[0]["current_user"];
    console.log(currentUser);
  } catch (err) {
    console.error(err);
  }
}

// Call the function to get current user
getCurrentUser();

// Set up routes
app.use("/api/auth", authRoutes);

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
