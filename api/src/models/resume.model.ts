import pg from "pg";
import dotenv from "dotenv";
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

// Function to create a new resume
export const createModelResume = async (
  userId: any,
  layers: any,
  colors: any
) => {
  try {
    // Define the SQL query to insert a new resume
    const insertResumeQuery = `
      INSERT INTO resumes (user_id, layers, colors, created_at, updated_at)
      VALUES ($1, $2, $3, DEFAULT, DEFAULT)
      RETURNING *; 
    `;

    // Prepare the JSON values for `layers` and `colors`
    const layersJson = JSON.stringify(layers);
    const colorsJson = JSON.stringify(colors);

    // Execute the query
    const result = await pool.query(insertResumeQuery, [
      userId,
      layersJson,
      colorsJson,
    ]);

    // Return the inserted resume
    return result.rows[0];
  } catch (error) {
    console.error("Error creating model resume:", error);
    throw new Error("Failed to create resume");
  }
};

// Function to find resumes by user ID
export const findResumesByUserId = async (userId: any) => {
  try {
    // Define the SQL query to fetch resumes by user ID
    const findResumesQuery = `
      SELECT *
      FROM resumes
      WHERE user_id = $1;
    `;

    // Execute the query
    const result = await pool.query(findResumesQuery, [userId]);

    // Return the found resumes
    return result.rows;
  } catch (error) {
    console.error("Error finding resumes by user ID:", error);
    throw new Error("Failed to retrieve resumes");
  }
};
