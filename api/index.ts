import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url"; // Simulate __dirname in ES modules
import pg from "pg";
import dotenv from "dotenv";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import postRoutes from "./src/routes/post.route.js";
import cookieParser from "cookie-parser";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Destructure Pool from the pg module
const { Pool } = pg;

// Initialize Express
const app = express();
app.use(express.json());
app.use(cookieParser());

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

// Async function to connect and query the database
async function getCurrentUser() {
  try {
    const { rows } = await pool.query("SELECT current_user");
    const currentUser = rows[0]["current_user"];
  } catch (err) {
    console.error(err);
  }
}

// Call the function to get current user
getCurrentUser();

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Define an interface for custom error
interface CustomError extends Error {
  statusCode?: number;
}

// Set up routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
