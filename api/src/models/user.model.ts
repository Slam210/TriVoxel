import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profile_picture: string;
  created_at: Date;
  updated_at: Date;
}

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
      INSERT INTO users (username, email, password, profile_picture, roleId, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'user',DEFAULT, DEFAULT)
      RETURNING *;
    `;
    await pool.query(insertUserQuery, [
      username,
      email,
      hashedPassword,
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    ]);

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

// Function to update the user in the database
export const updateUserInDatabase = async (
  userId: string,
  updatedFields: {
    username?: string;
    email?: string;
    profilePicture?: string;
    password?: string;
  }
): Promise<any> => {
  // Create an array to hold the fields to update and their corresponding values
  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  // Add the fields to the update query only if they are provided
  if (updatedFields.username) {
    fieldsToUpdate.push("username = $1");
    values.push(updatedFields.username);
  }
  if (updatedFields.email) {
    fieldsToUpdate.push("email = $" + (values.length + 1));
    values.push(updatedFields.email);
  }
  if (updatedFields.profilePicture) {
    fieldsToUpdate.push("profile_picture = $" + (values.length + 1));
    values.push(updatedFields.profilePicture);
  }
  if (updatedFields.password) {
    fieldsToUpdate.push("password = $" + (values.length + 1));
    values.push(updatedFields.password);
  }

  // Throw an error if no valid fields are provided
  if (fieldsToUpdate.length === 0) {
    throw new Error("No valid fields to update");
  }

  // Construct the dynamic update query
  const updateUserQuery = `
    UPDATE users
    SET ${fieldsToUpdate.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length + 1}
    RETURNING id, username, email, profile_picture, created_at, updated_at;
  `;

  // Add the userId to the values array
  values.push(userId);

  // Execute the query
  const result = await pool.query(updateUserQuery, values);

  return result.rows[0];
};

// Function to delete a user by ID
export const deleteUserInDatabase = async (
  userId: string
): Promise<boolean> => {
  try {
    // Query to delete the user by their ID
    const deleteUserQuery = `
      DELETE FROM users WHERE id = $1 RETURNING id;
    `;

    // Execute the query
    const result: any = await pool.query(deleteUserQuery, [userId]);

    // Check if any row was affected (i.e., user was found and deleted)
    if (result.rowCount > 0) {
      console.log(`User with ID ${userId} has been deleted.`);
      return true; // Return true if the user was deleted
    } else {
      console.log(`User with ID ${userId} not found.`);
      return false; // Return false if no user was found
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("User deletion failed due to a database error");
  }
};

// Fetch users with pagination and sorting
export const getUsersFromDatabase = async (
  startIndex: number,
  limit: number,
  sortDirection: "asc" | "desc"
): Promise<User[]> => {
  const query = `
    SELECT id, username, email, roleId, profile_picture, created_at, updated_at
    FROM users
    ORDER BY created_at ${sortDirection === "asc" ? "ASC" : "DESC"}
    OFFSET $1 LIMIT $2;
  `;

  const result = await pool.query(query, [startIndex, limit]);
  return result.rows;
};

// Get total user count
export const getUsersCount = async (): Promise<number> => {
  const query = `
    SELECT COUNT(*) FROM users;
  `;

  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

// Get count of users created in the last month
export const getLastMonthUsersCount = async (): Promise<number> => {
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const query = `
    SELECT COUNT(*) FROM users
    WHERE created_at >= $1;
  `;

  const result = await pool.query(query, [oneMonthAgo]);
  return parseInt(result.rows[0].count, 10);
};
