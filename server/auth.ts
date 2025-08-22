import { db } from './db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function getUserById(id: number) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    console.log('User data from database:', user); // Debug log
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function getUserByUsernameOrEmail(usernameOrEmail: string) {
  try {
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
    );
    return user;
  } catch (error) {
    console.error('Error getting user by username or email:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function isUsernameTaken(username: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return !!user;
  } catch (error) {
    console.error('Error checking if username is taken:', error);
    return false;
  }
}

export async function isEmailTaken(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return !!user;
  } catch (error) {
    console.error('Error checking if email is taken:', error);
    return false;
  }
}

// Generate a unique 6-digit balance code
async function generateUniqueBalanceCode(): Promise<string> {
  // Try up to 10 times to generate a unique code
  for (let attempt = 0; attempt < 10; attempt++) {
    // Generate a random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if this code is already in use
    const [existingUser] = await db.select().from(users).where(eq(users.balance_code, code));
    
    if (!existingUser) {
      return code;
    }
  }
  
  // If we couldn't generate a unique code after 10 attempts, use timestamp + random digits
  return (Date.now() % 1000000).toString().padStart(6, '0');
}

export async function createUser(userData: { 
  username: string; 
  email: string; 
  password: string; 
  phone: string;
  full_name?: string;
  verification_status?: string;
}) {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate a unique balance code
    const balanceCode = await generateUniqueBalanceCode();
    
    // Insert the user
    const [user] = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone,
      full_name: userData.full_name || null,
      balance_code: balanceCode,
      balance: 0,
      role: 'user', // Default role for new users
      verification_status: userData.verification_status || 'unverified' // Default to unverified
    }).returning();
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function validatePassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}