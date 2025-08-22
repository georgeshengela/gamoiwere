import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function migrateDatabase() {
  try {
    console.log("Starting database migration...");
    
    // Check if users table exists and has the correct structure
    const createUsersTable = async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          full_name TEXT,
          phone TEXT,
          address TEXT
        );
      `);
      console.log("Users table created or verified");
    };
    
    await createUsersTable();
    
    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error in database migration:", error);
  } finally {
    process.exit(0);
  }
}

migrateDatabase();