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

// Function to create a new post with subtitle and cover_image
export const createPost = async (
  userId: string,
  title: string,
  content: string,
  slug: string,
  category: string = "uncategorized",
  subtitle: string = "",
  cover_image: string // Expect cover_image to be the file path or URL
): Promise<boolean> => {
  try {
    // Check if the post title or slug already exists
    const existingPostQuery = `
      SELECT * FROM posts WHERE title = $1 OR slug = $2;
    `;
    const existingPost = await pool.query(existingPostQuery, [title, slug]);

    if (existingPost.rows.length > 0) {
      console.log("Error: Post with the same title or slug already exists.");
      return false; // Indicate that post creation failed due to a duplicate
    }

    // Insert new post into the database
    const insertPostQuery = `
      INSERT INTO posts (userId, title, content, slug, category, subtitle, cover_image, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, DEFAULT, DEFAULT)
      RETURNING *;
    `;
    await pool.query(insertPostQuery, [
      userId,
      title,
      content,
      slug,
      category,
      subtitle, // New subtitle field
      cover_image, // Use the cover image path received from the request
    ]);

    return true; // Post creation successful
  } catch (err) {
    console.error("Error creating post:", err);
    throw new Error("Post creation failed due to a database error");
  }
};
