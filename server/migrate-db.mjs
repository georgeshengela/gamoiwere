import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Running migrations...');
    
    // Check if addresses table exists
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'addresses'
    `;
    
    if (tablesResult.length === 0) {
      console.log('Creating addresses table...');
      await sql`
        CREATE TABLE addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          recipient_name TEXT NOT NULL,
          recipient_phone TEXT NOT NULL,
          street_address TEXT NOT NULL,
          city TEXT NOT NULL,
          postal_code TEXT,
          region TEXT,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('Addresses table created successfully');
    } else {
      console.log('Addresses table already exists');
    }

    // Check if default_address_id column exists in users table
    const columnsResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'default_address_id'
    `;
    
    if (columnsResult.length === 0) {
      console.log('Adding default_address_id column to users table...');
      await sql`
        ALTER TABLE users 
        ADD COLUMN default_address_id INTEGER
      `;
      console.log('Default address ID column added successfully');
    } else {
      console.log('Default address ID column already exists');
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

runMigrations().catch(console.error);