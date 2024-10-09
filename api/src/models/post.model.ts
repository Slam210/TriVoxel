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

// Query to get posts with filters, sorting, and pagination
export const fetchPosts = async (
  startIndex: number,
  limit: number,
  sortDirection: string,
  filters: string[],
  queryParams: any[]
) => {
  const filterQuery = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const postsQuery = `
    SELECT * FROM posts
    ${filterQuery}
    ORDER BY "updated_at" ${sortDirection}
    OFFSET $${queryParams.length + 1} LIMIT $${queryParams.length + 2};
  `;

  queryParams.push(startIndex, limit);

  const result = await pool.query(postsQuery, queryParams);
  return result.rows;
};

// Query to count total posts
export const countTotalPosts = async () => {
  const totalPostsQuery = `SELECT COUNT(*) FROM posts;`;
  const result = await pool.query(totalPostsQuery);
  return parseInt(result.rows[0].count);
};

// Query to count posts created within the last month
export const countLastMonthPosts = async (oneMonthAgo: Date) => {
  const lastMonthPostsQuery = `
    SELECT COUNT(*) FROM posts WHERE "created_at" >= $1;
  `;
  const result = await pool.query(lastMonthPostsQuery, [oneMonthAgo]);
  return parseInt(result.rows[0].count);
};

// Query to get posts by userId and allowed categories
export const fetchUserPosts = async (
  userId: string,
  startIndex: number,
  limit: number,
  sortDirection: string,
  allowedCategories: string[] // Pass the allowed categories based on the role
) => {
  const postsQuery = `
    SELECT * FROM posts
    WHERE "userid" = $1 AND category = ANY($4)
    ORDER BY "updated_at" ${sortDirection}
    OFFSET $2 LIMIT $3;
  `;

  const result = await pool.query(postsQuery, [
    userId,
    startIndex,
    limit,
    allowedCategories,
  ]);
  return result.rows;
};
