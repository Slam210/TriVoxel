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

export const createUserComment = async (
  content: string,
  postId: number,
  userId: number
) => {
  try {
    // Define the SQL query to insert a new comment into the 'comments' table
    const insertCommentQuery = `
      INSERT INTO comments (content, post_id, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, DEFAULT, DEFAULT)
      RETURNING *;  -- Return the newly created comment
    `;

    // Execute the query and pass the values (content, postId, userId)
    const result = await pool.query(insertCommentQuery, [
      content,
      postId,
      userId,
    ]);

    // Return the inserted comment
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user comment:", error);
    throw new Error("Failed to create comment");
  }
};

export const findPostComments = async (postId: number) => {
  try {
    // Define the SQL query to fetch comments sorted by created_at
    const findPostCommentsQuery = `
      SELECT * FROM comments 
      WHERE post_id = $1
      ORDER BY created_at DESC;
    `;

    // Execute the query and pass the values (postId)
    const result = await pool.query(findPostCommentsQuery, [postId]);

    console.log(result.rows);

    // Return the comments found
    return result.rows;
  } catch (error) {
    console.error("Error finding post comments:", error);
    throw error;
  }
};

// Find comment by ID
export const findCommentById = async (commentId: string) => {
  try {
    const query = `SELECT * FROM comments WHERE id = $1`;
    const result = await pool.query(query, [commentId]);
    return result.rows[0]; // Return the comment or undefined if not found
  } catch (error) {
    console.error("Error finding comment:", error);
    throw new Error("Failed to find comment");
  }
};

// Update comment likes and number_of_likes in the database
export const updateCommentLikes = async (
  commentId: string,
  likes: string[],
  numberOfLikes: number
) => {
  try {
    const query = `
      UPDATE comments
      SET likes = $1, number_of_likes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [likes, numberOfLikes, commentId]);
    return result.rows[0]; // Return the updated comment
  } catch (error) {
    console.error("Error updating comment likes:", error);
    throw new Error("Failed to update comment likes");
  }
};

// Update comment content in the database
export const updateCommentContent = async (
  commentId: string,
  content: string
) => {
  try {
    const query = `
      UPDATE comments
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [content, commentId]);
    return result.rows[0]; // Return the updated comment
  } catch (error) {
    console.error("Error updating comment content:", error);
    throw new Error("Failed to update comment");
  }
};
