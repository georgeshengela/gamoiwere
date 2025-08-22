import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import jwt from "jsonwebtoken";
import { insertUserSchema, notifications, insertNotificationSchema, searchSuggestions, translations, priceAnalyses } from "@shared/schema";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertSliderSchema, products, orders, deliveryTracking } from "@shared/schema";
import * as auth from "./auth";
import { pool, db } from "./db";
import { sql, eq, desc, and, or } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import { uploadImageHandler } from "./routes/image-upload";
import { generateSitemap } from "./routes/sitemap";
import path from "path";
import OpenAI from "openai";
import { sendWelcomeEmail, testMailchimpConnection } from "./mailchimp";
import { gmailService } from "./gmail";
import { welcomeEmailService } from "./welcomeEmail";
import { orderEmailService } from "./orderEmail";
import { smsService } from "./sms";
import { createProxyMiddleware } from 'http-proxy-middleware';
import crypto from 'crypto';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// WebSocket connection management for real-time notifications
interface UserConnection {
  userId: number;
  ws: WebSocket;
}

const userConnections = new Map<number, WebSocket>();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// BOG Payment Configuration
const BOG_CLIENT_ID = process.env.BOG_CLIENT_ID;
const BOG_CLIENT_SECRET = process.env.BOG_CLIENT_SECRET;
const BOG_AUTH_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
const BOG_ORDERS_URL = 'https://api.bog.ge/payments/v1/ecommerce/orders';
const BOG_RECEIPT_URL = 'https://api.bog.ge/payments/v1/receipt';

// BOG Payment Functions
async function getBogAuthToken(): Promise<string> {
  if (!BOG_CLIENT_ID || !BOG_CLIENT_SECRET) {
    throw new Error('BOG credentials not configured. Please set BOG_CLIENT_ID and BOG_CLIENT_SECRET environment variables.');
  }
  
  const credentials = Buffer.from(`${BOG_CLIENT_ID}:${BOG_CLIENT_SECRET}`).toString('base64');
  
  try {
    console.log('BOG Auth URL:', BOG_AUTH_URL);
    const response = await fetch(BOG_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    });

    const responseText = await response.text();
    console.log('BOG Auth response status:', response.status);
    console.log('BOG Auth response:', responseText);

    if (!response.ok) {
      throw new Error(`BOG Auth failed: ${response.status} ${response.statusText}`);
    }

    const data = JSON.parse(responseText);
    console.log('BOG Auth token received:', data.access_token ? 'Token present' : 'No token');
    return data.access_token;
  } catch (error) {
    console.error('BOG authentication error:', error);
    throw error;
  }
}

async function createBogPaymentOrder(token: string, orderData: any): Promise<any> {
  try {
    console.log('Creating BOG order with URL:', BOG_ORDERS_URL);
    console.log('Authorization header present:', token ? 'Yes' : 'No');
    console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(BOG_ORDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept-Language': 'ka'
      },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    console.log('BOG Order creation response status:', response.status);
    console.log('BOG Order creation response headers:', Object.fromEntries(response.headers.entries()));
    console.log('BOG Order creation response body:', responseText);

    if (!response.ok) {
      console.error('BOG Order creation error:', response.status, responseText);
      throw new Error(`BOG Order creation failed: ${response.status}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('BOG order creation error:', error);
    throw error;
  }
}

async function getBogPaymentDetails(token: string, orderId: string): Promise<any> {
  try {
    const response = await fetch(`${BOG_RECEIPT_URL}/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`BOG Payment details failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BOG payment details error:', error);
    throw error;
  }
}

// JWT middleware for mobile authentication
interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Extracted token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'ტოკენი საჭიროა' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'წვდომა აკრძალულია' });
    }
    console.log('JWT decoded user:', user);
    req.user = user;
    next();
  });
};

// Helper function to create and send real-time notifications
async function createAndSendNotification(userId: number, orderId: number | null, title: string, message: string, type: string) {
  try {
    // Create notification in database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        orderId,
        title,
        message,
        type,
        isRead: false
      })
      .returning();

    // Send real-time notification via WebSocket if user is connected
    const userWs = userConnections.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      console.log(`Real-time notification sent to user ${userId}: ${title}`);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Get the correct redirect URI based on environment
const getRedirectUri = (req: express.Request) => {
  // If we detect we're on the production domain, use the production URL
  const host = req.get('host');
  if (host && (host.includes('gamoiwere.ge') || host.includes('replit.app'))) {
    return 'https://gamoiwere.ge/api/auth/google/callback';
  }
  
  // For local development
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  return `${protocol}://${host}/api/auth/google/callback`;
};

// Session middleware
const configureSessionMiddleware = (app: Express) => {
  const sessionSecret = process.env.SESSION_SECRET || "gamoiwere-secret-key";
  const pgSession = connectPgSimple(session);
  
  console.log('Configuring session middleware with database store');
  
  const sessionStore = new pgSession({
    pool: pool, // Using the pool directly from db.ts
    tableName: 'sessions', // Use the sessions table we defined
    createTableIfMissing: true
  });
  
  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: 'connect.sid', // Explicitly set session name
      cookie: {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        domain: undefined, // Allow cookies on all subdomains
      }
    })
  );
  
  console.log('Session middleware configured successfully');
};

// Utility functions
const compareEmails = (email1: string, email2: string): boolean => {
  return email1.toLowerCase() === email2.toLowerCase();
};

// JWT middleware for mobile authentication
const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await auth.getUserById(decoded.userId);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: 'Invalid token' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Token required' });
  }
};

// Auth middleware (supports both session and JWT)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth check - Session ID:', req.sessionID);
  console.log('Auth check - Session data:', req.session);
  console.log('Auth check - Session user:', req.session.user);
  
  if (req.session && req.session.user) {
    console.log('Session authentication successful');
    next();
  } else {
    // Check if Authorization header exists for JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Attempting JWT authentication');
      authenticateJWT(req, res, next);
    } else {
      console.log('No session user found, session data:', req.session);
      res.status(401).json({ message: 'არ ხართ ავტორიზებული' });
    }
  }
};

// Admin middleware
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Admin check - Session ID:', req.sessionID);
  console.log('Admin check - Session data:', req.session);
  console.log('Admin check - Session user:', req.session.user);
  
  if (req.session.user) {
    // Get fresh user data from database to ensure we have the latest role
    const user = await auth.getUserById(req.session.user.id);
    if (user && user.role === 'admin') {
      console.log('Admin access granted for user:', user.username);
      next();
    } else {
      console.log('Admin access denied - user role:', user?.role || 'no user found');
      res.status(403).json({ message: 'Admin access required' });
    }
  } else {
    console.log('Admin check - No session user found');
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up trust proxy for sessions to work behind reverse proxy
  app.set('trust proxy', 1);
  
  // Configure session middleware
  configureSessionMiddleware(app);
  
  // Serve static files from the public directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  
  // System monitoring endpoint - accessible at /api/admin/monitoring (admin only)
  app.get('/api/admin/monitoring', isAdmin, async (req, res) => {
    try {
      const { systemMonitor } = await import('./monitoring.js');
      const metrics = await systemMonitor.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  });
  
  // Check username availability (no authentication required)
  app.get('/api/auth/check-username/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ 
          available: false,
          message: 'მომხმარებლის სახელი არ შეიძლება იყოს ცარიელი' 
        });
      }

      if (username.trim().length < 3) {
        return res.status(400).json({ 
          available: false,
          message: 'მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს' 
        });
      }
      
      const isUsernameTaken = await auth.isUsernameTaken(username.trim());
      
      if (isUsernameTaken) {
        return res.status(200).json({ 
          available: false, 
          message: 'მომხმარებლის სახელი უკვე გამოყენებულია' 
        });
      }
      
      res.status(200).json({ 
        available: true, 
        message: 'მომხმარებლის სახელი ხელმისაწვდომია' 
      });
    } catch (error) {
      console.error('Error checking username availability:', error);
      res.status(500).json({ 
        available: false,
        message: 'შეცდომა სერვერზე' 
      });
    }
  });

  // Check email availability (no authentication required)
  app.get('/api/auth/check-email/:email', async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email || email.trim().length === 0) {
        return res.status(400).json({ 
          available: false,
          message: 'ელ. ფოსტა არ შეიძლება იყოს ცარიელი' 
        });
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          available: false, 
          message: 'ელ. ფოსტის ფორმატი არასწორია' 
        });
      }
      
      const isEmailTaken = await auth.isEmailTaken(email.trim());
      
      if (isEmailTaken) {
        return res.status(200).json({ 
          available: false, 
          message: 'ელ. ფოსტა უკვე გამოყენებულია' 
        });
      }
      
      res.status(200).json({ 
        available: true, 
        message: 'ელ. ფოსტა ხელმისაწვდომია' 
      });
    } catch (error) {
      console.error('Error checking email availability:', error);
      res.status(500).json({ 
        available: false,
        message: 'შეცდომა სერვერზე' 
      });
    }
  });

  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, phone, password, confirmPassword } = req.body;
      
      // Validate input
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'პაროლები არ ემთხვევა' });
      }
      
      // Check if username or email is already taken
      const isUsernameTaken = await auth.isUsernameTaken(username);
      if (isUsernameTaken) {
        return res.status(400).json({ message: 'მომხმარებლის სახელი უკვე გამოყენებულია' });
      }
      
      const isEmailTaken = await auth.isEmailTaken(email);
      if (isEmailTaken) {
        return res.status(400).json({ message: 'ელ. ფოსტა უკვე გამოყენებულია' });
      }
      
      // Create user with hashed password (handled in auth.createUser)
      const user = await auth.createUser({
        username,
        email,
        phone,
        password,
        full_name: ""
      });
      
      // Send welcome email via Gmail with database template
      try {
        const emailSent = await welcomeEmailService.sendWelcomeEmail(user);
        
        if (emailSent) {
          console.log(`Welcome email sent successfully to ${user.email}`);
        } else {
          console.log(`Failed to send welcome email to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail registration if email fails
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'რეგისტრაცია ვერ მოხერხდა' });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      
      // Find user
      const user = await auth.getUserByUsernameOrEmail(usernameOrEmail);
      if (!user) {
        return res.status(400).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
      
      // Check if user has a temporary password and is using it
      const isUsingTempPassword = user.temp_password && password === user.temp_password;
      console.log('Password check:', {
        inputPassword: password,
        storedTempPassword: user.temp_password,
        passwordsMatch: password === user.temp_password,
        isUsingTempPassword
      });
      
      // Check password (either regular password or temporary password)
      const isPasswordValid = await auth.validatePassword(password, user.password);
      if (!isPasswordValid && !isUsingTempPassword) {
        return res.status(400).json({ message: 'პაროლი არასწორია' });
      }
      
      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = user;
      
      // Check if request is from mobile client (React Native)
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = userAgent.includes('Expo') || userAgent.includes('ReactNative') || req.headers['x-mobile-client'];
      
      if (isMobile) {
        // Generate JWT token for mobile clients
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          success: true,
          token,
          user: {
            ...userWithoutPassword,
            requiresPasswordChange: isUsingTempPassword
          }
        });
      } else {
        // Set user in session for web clients
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        };
        
        console.log('Login result:', {
          userId: user.id,
          hasTemPassword: !!user.temp_password,
          tempPassword: user.temp_password,
          inputPassword: password,
          isUsingTempPassword,
          requiresPasswordChange: isUsingTempPassword
        });

        res.json({ 
          ...userWithoutPassword, 
          requiresPasswordChange: isUsingTempPassword 
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'შესვლა ვერ მოხერხდა' });
    }
  });

  // Password reset endpoints
  app.post('/api/auth/forgot-password-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'ელ-ფოსტის მისამართი აუცილებელია' });
      }
      
      // Find user by email
      const user = await auth.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'მომხმარებელი ამ ელ-ფოსტით ვერ მოიძებნა' });
      }
      
      // Generate 6-digit temporary password
      const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash the temporary password and update user
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
      await storage.updateUser(user.id, { 
        password: hashedTempPassword,
        temp_password: tempPassword // Store for reference
      });
      
      // Send email with temporary password
      try {
        const emailSent = await gmailService.sendTestEmail({
          to: email,
          subject: 'პაროლის აღდგენა - GAMOIWERE.GE',
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #5b38ed;">პაროლის აღდგენა</h2>
              <p>გამარჯობა <strong>${user.username}</strong>,</p>
              <p>თქვენი დროებითი პაროლი არის:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin: 20px 0;">
                ${tempPassword}
              </div>
              <p style="color: #e74c3c; font-weight: bold;">უსაფრთხოების მიზნებისდა, გთხოვთ შეცვალოთ პაროლი შესვლის შემდეგ.</p>
              <p>თუ თქვენ არ მოითხოვეთ ეს პაროლის აღდგენა, გთხოვთ დაუყოვნებლივ დაგვიკავშირდეთ.</p>
              <br>
              <p>მადლობა,<br><strong>GAMOIWERE.GE გუნდი</strong></p>
            </div>
          `
        });
        
        if (emailSent) {
          res.json({ success: true, message: 'დროებითი პაროლი გაიგზავნა ელ-ფოსტაზე' });
        } else {
          res.status(500).json({ message: 'ელ-ფოსტის გაგზავნა ვერ მოხერხდა' });
        }
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        res.status(500).json({ message: 'ელ-ფოსტის გაგზავნა ვერ მოხერხდა' });
      }
    } catch (error) {
      console.error('Error in forgot password email:', error);
      res.status(500).json({ message: 'შეცდომა მოხდა სერვერზე' });
    }
  });

  app.post('/api/auth/forgot-password-sms', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: 'ტელეფონის ნომერი აუცილებელია' });
      }
      
      // Normalize phone number
      let normalizedPhone = phone.replace(/[^\d]/g, '');
      if (normalizedPhone.startsWith('995')) {
        normalizedPhone = normalizedPhone.substring(3);
      }
      if (!normalizedPhone.startsWith('5')) {
        normalizedPhone = '5' + normalizedPhone;
      }
      
      // Find user by phone
      const users = await storage.getAllUsers();
      const user = users.find(u => {
        if (!u.phone) return false;
        let userPhone = u.phone.replace(/[^\d]/g, '');
        if (userPhone.startsWith('995')) {
          userPhone = userPhone.substring(3);
        }
        if (!userPhone.startsWith('5')) {
          userPhone = '5' + userPhone;
        }
        return userPhone === normalizedPhone;
      });
      
      if (!user) {
        return res.status(400).json({ message: 'მომხმარებელი ამ ტელეფონის ნომრით ვერ მოიძებნა' });
      }
      
      // Generate 6-digit temporary password
      const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash the temporary password and update user
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
      await storage.updateUser(user.id, { 
        password: hashedTempPassword,
        temp_password: tempPassword // Store for reference
      });
      
      // Send SMS with temporary password
      try {
        const smsResult = await smsService.sendSms({
          to: phone,
          message: `GAMOIWERE.GE - თქვენი დროებითი პაროლი: ${tempPassword}. უსაფრთხოების მიზნებისდა, გთხოვთ შეცვალოთ პაროლი შესვლის შემდეგ.`
        });
        
        if (smsResult.success) {
          res.json({ success: true, message: 'დროებითი პაროლი გაიგზავნა SMS-ით' });
        } else {
          res.status(500).json({ message: 'SMS-ის გაგზავნა ვერ მოხერხდა: ' + smsResult.error });
        }
      } catch (smsError) {
        console.error('Error sending password reset SMS:', smsError);
        res.status(500).json({ message: 'SMS-ის გაგზავნა ვერ მოხერხდა' });
      }
    } catch (error) {
      console.error('Error in forgot password SMS:', error);
      res.status(500).json({ message: 'შეცდომა მოხდა სერვერზე' });
    }
  });

  // Password change endpoint for users with temporary passwords
  app.post('/api/auth/change-password', isAuthenticated, async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'ყველა ველის შევსება აუცილებელია' });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'პაროლები არ ემთხვევა' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს' });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password and remove temporary password
      await storage.updateUser(req.session.user.id, { 
        password: hashedPassword,
        temp_password: null
      });
      
      res.json({ success: true, message: 'პაროლი წარმატებით შეიცვალა' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'პაროლის შეცვლა ვერ მოხერხდა' });
    }
  });
  
  // Test endpoint to check session functionality
  app.post('/api/session-test', (req, res) => {
    console.log('Session test - ID:', req.sessionID);
    console.log('Session test - Data:', req.session);
    
    // Set a test value
    req.session.testValue = 'session_working_' + Date.now();
    
    res.json({
      sessionId: req.sessionID,
      testValue: req.session.testValue,
      sessionData: req.session
    });
  });

  // Mobile Authentication Endpoints with JWT
  app.post('/api/mobile/auth/login', async (req, res) => {
    console.log('Mobile login attempt started:', { username: req.body.username });
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        console.log('Mobile login failed: missing credentials');
        return res.status(400).json({ message: 'მომხმარებლის სახელი და პაროლი აუცილებელია' });
      }
      
      console.log('Looking up user:', username);
      // Find user by username or email
      const user = await auth.getUserByUsernameOrEmail(username);
      if (!user) {
        console.log('Mobile login failed: user not found');
        return res.status(400).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
      
      console.log('User found, validating password for:', user.username);
      // Check password
      const isPasswordValid = await auth.validatePassword(password, user.password);
      if (!isPasswordValid) {
        console.log('Mobile login failed: invalid password');
        return res.status(400).json({ message: 'პაროლი არასწორია' });
      }
      
      console.log('Password valid, creating JWT token');
      // Create JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('JWT token created, sending response');
      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });
      console.log('Mobile login successful for:', user.username);
    } catch (error) {
      console.error('Mobile login error:', error);
      res.status(500).json({ message: 'შესვლა ვერ მოხერხდა' });
    }
  });

  // Mobile token verification endpoint
  app.post('/api/mobile/auth/verify-token', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Get fresh user data from database
      const user = await auth.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Mobile registration with OTP verification
  app.post('/api/mobile/auth/register', async (req, res) => {
    try {
      const { username, email, password, full_name, phone, confirmPassword, terms } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !confirmPassword || !phone || !terms) {
        return res.status(400).json({ message: 'ყველა ველის შევსება აუცილებელია' });
      }
      
      // Validate password match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'პაროლები არ ემთხვევა' });
      }
      
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს' });
      }
      
      // Validate terms acceptance
      if (!terms) {
        return res.status(400).json({ message: 'წესებისა და პირობების დათანხმება აუცილებელია' });
      }
      
      // Check if username or email is already taken
      const isUsernameTaken = await auth.isUsernameTaken(username);
      if (isUsernameTaken) {
        return res.status(400).json({ message: 'მომხმარებლის სახელი უკვე გამოყენებულია' });
      }
      
      const isEmailTaken = await auth.isEmailTaken(email);
      if (isEmailTaken) {
        return res.status(400).json({ message: 'ელ. ფოსტა უკვე გამოყენებულია' });
      }
      
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store registration data temporarily with OTP
      const tempRegistrationData = {
        username,
        email,
        phone,
        password,
        full_name: full_name || "",
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        created: new Date()
      };
      
      // Store in session or temporary storage (using session for simplicity)
      req.session.tempRegistration = tempRegistrationData;
      
      // Send OTP via SMS
      try {
        const { smsService } = await import('./sms');
        const smsResult = await smsService.sendSms({ 
          to: phone, 
          message: `თქვენი GAMOIWERE.GE-ის რეგისტრაციის კოდი: ${otp}. კოდი ვალიდურია 10 წუთის განმავლობაში.`
        });
        console.log('Registration OTP SMS sent successfully:', smsResult);
        
        res.status(200).json({
          success: true,
          message: 'რეგისტრაციის კოდი გაიგზავნა თქვენს ტელეფონზე',
          phone: phone.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2') // Mask phone number
        });
      } catch (smsError) {
        console.error('Error sending registration OTP SMS:', smsError);
        res.status(500).json({ message: 'SMS-ის გაგზავნა ვერ მოხერხდა' });
      }
    } catch (error) {
      console.error('Mobile registration error:', error);
      res.status(500).json({ message: 'რეგისტრაცია ვერ მოხერხდა' });
    }
  });

  // Mobile OTP verification for registration
  app.post('/api/mobile/auth/verify-otp', async (req, res) => {
    try {
      const { otp } = req.body;
      
      if (!otp) {
        return res.status(400).json({ message: 'რეგისტრაციის კოდი საჭიროა' });
      }
      
      // Get temporary registration data from session
      const tempData = req.session.tempRegistration;
      if (!tempData) {
        return res.status(400).json({ message: 'რეგისტრაციის მონაცემები ვერ მოიძებნა' });
      }
      
      // Check if OTP has expired
      if (new Date() > tempData.otpExpiry) {
        delete req.session.tempRegistration;
        return res.status(400).json({ message: 'რეგისტრაციის კოდის ვადა ამოიწურა' });
      }
      
      // Verify OTP
      if (otp !== tempData.otp) {
        return res.status(400).json({ message: 'რეგისტრაციის კოდი არასწორია' });
      }
      
      // Create user after successful OTP verification with verified status
      const user = await auth.createUser({
        username: tempData.username,
        email: tempData.email,
        phone: tempData.phone,
        password: tempData.password,
        full_name: tempData.full_name,
        verification_status: "verified" // Mark as verified since phone is confirmed via OTP
      });
      
      // Clear temporary registration data
      delete req.session.tempRegistration;
      
      // Create JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        success: true,
        token,
        user: userWithoutPassword,
        message: 'რეგისტრაცია წარმატებით დასრულდა'
      });
    } catch (error) {
      console.error('Mobile OTP verification error:', error);
      res.status(500).json({ message: 'რეგისტრაციის დასტური ვერ მოხერხდა' });
    }
  });

  // Mobile token verification endpoint
  app.post('/api/mobile/auth/verify', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // If we reach here, token is valid (middleware passed)
      const userId = req.user.id;
      
      // Get fresh user data from database
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'მომხმარებელი ვერ მოიძებნა' });
      }
      
      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ success: false, message: 'ტოკენი არასწორია' });
    }
  });

  app.post('/api/mobile/auth/user', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Get user data from token
      const userId = req.user.id;
      const user = await auth.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
      
      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Mobile user fetch error:', error);
      res.status(500).json({ message: 'მომხმარებლის მონაცემები ვერ მოიძებნა' });
    }
  });

  // Mobile order details endpoint
  app.get('/api/mobile/orders/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;
      
      console.log('Order details request - Order ID:', orderId, 'User ID:', userId);
      
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ message: 'არასწორი შეკვეთის ID' });
      }
      
      // Get order from database
      const order = await storage.getOrderById(orderId);
      
      console.log('Order found:', order ? `Order ID ${order.id}` : 'No order found');
      console.log('Complete order object:', JSON.stringify(order, null, 2));
      
      if (!order) {
        return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა' });
      }
      
      // Check if user owns this order
      console.log('Order ownership check - Order userId:', order.userId, 'Request user id:', userId, 'Match:', order.userId === userId);
      if (order.userId !== userId) {
        return res.status(403).json({ message: 'წვდომა აკრძალულია' });
      }
      
      // Get delivery tracking if exists (using snake_case column names from database)
      let deliveryTracking = null;
      try {
        const result = await db.execute(sql`
          SELECT 
            id,
            order_id as "orderId",
            product_weight as "productWeight", 
            transportation_price as "transportationPrice",
            tracking_number as "trackingNumber",
            delivery_status as "deliveryStatus",
            ordered_at as "orderedAt",
            received_china_at as "receivedChinaAt", 
            sent_tbilisi_at as "sentTbilisiAt",
            delivered_tbilisi_at as "deliveredTbilisiAt",
            notes,
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM delivery_tracking 
          WHERE order_id = ${orderId}
        `);
        deliveryTracking = result.rows[0] || null;
        console.log('Delivery tracking query result:', deliveryTracking ? 'Found tracking data' : 'No tracking data');
        if (deliveryTracking) {
          console.log('Delivery tracking data:', JSON.stringify(deliveryTracking, null, 2));
        }
      } catch (trackingError) {
        console.log('Delivery tracking query error:', trackingError);
      }
      
      res.json({
        order,
        deliveryTracking
      });
    } catch (error) {
      console.error('Mobile order details error:', error);
      res.status(500).json({ message: 'შეკვეთის დეტალები ვერ მოიძებნა' });
    }
  });

  // Mobile profile update endpoint
  app.post('/api/user/update', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { full_name, email, phone, address } = req.body;
      
      // Validate input
      if (!full_name || !email) {
        return res.status(400).json({ message: 'სახელი და ელ. ფოსტა აუცილებელია' });
      }
      
      // Check if user exists
      const existingUser = await auth.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
      
      // Update user profile
      const updatedUser = await auth.updateUser(userId, {
        full_name,
        email,
        phone: phone || existingUser.phone,
        address: address || existingUser.address
      });
      
      // Remove password from response
      const { password: _, temp_password: __, ...userWithoutPassword } = updatedUser;
      
      res.json({
        success: true,
        user: userWithoutPassword,
        message: 'პროფილი წარმატებით განახლდა'
      });
    } catch (error) {
      console.error('Mobile profile update error:', error);
      res.status(500).json({ message: 'პროფილის განახლება ვერ მოხერხდა' });
    }
  });

  // Mobile orders endpoint
  app.get('/api/mobile/orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      
      // Get orders for the authenticated user
      const orders = await storage.getOrdersByUserId(userId);
      
      res.json(orders);
    } catch (error) {
      console.error('Mobile orders fetch error:', error);
      res.status(500).json({ message: 'შეკვეთების მოძიება ვერ მოხერხდა' });
    }
  });

  // Alternative auth endpoint that works around routing conflicts
  app.post('/api/check-auth', async (req, res) => {
    console.log('Check auth - Session ID:', req.sessionID);
    console.log('Check auth - Session data:', req.session);
    console.log('Check auth - Session user:', req.session.user);
    
    if (req.session.user) {
      // Get the fresh user data from the database with all fields
      const user = await auth.getUserById(req.session.user.id);
      if (user) {
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        console.log('Check auth returning user data:', { id: user.id, username: user.username });
        res.json(userWithoutPassword);
      } else {
        console.log('Check auth user not found in database for ID:', req.session.user.id);
        res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
    } else {
      console.log('Check auth no session user found, session data:', req.session);
      res.status(401).json({ message: 'არ ხართ ავტორიზებული' });
    }
  });

  // Debug endpoint to check session immediately after OAuth
  app.get('/api/debug-session', (req, res) => {
    console.log('DEBUG SESSION - ID:', req.sessionID);
    console.log('DEBUG SESSION - Full session:', req.session);
    console.log('DEBUG SESSION - User:', req.session.user);
    console.log('DEBUG SESSION - Cookie:', req.session.cookie);
    console.log('DEBUG SESSION - Headers:', req.headers);
    
    res.json({
      sessionId: req.sessionID,
      hasUser: !!req.session.user,
      user: req.session.user || null,
      cookie: req.session.cookie,
      headers: {
        cookie: req.headers.cookie,
        userAgent: req.headers['user-agent']
      }
    });
  });

  // Use POST instead of GET to avoid frontend routing conflicts
  app.post('/api/auth/user', async (req, res) => {
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - Session data:', req.session);
    console.log('Auth check - Session user:', req.session.user);
    
    if (req.session.user) {
      // Get the fresh user data from the database with all fields
      const user = await auth.getUserById(req.session.user.id);
      if (user) {
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        console.log('Returning user data:', { id: user.id, username: user.username });
        res.json(userWithoutPassword);
      } else {
        console.log('User not found in database for ID:', req.session.user.id);
        res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
    } else {
      console.log('No session user found, session data:', req.session);
      res.status(401).json({ message: 'არ ხართ ავტორიზებული' });
    }
  });

  // Keep GET endpoint as fallback but with debugging
  app.get('/api/auth/user', async (req, res) => {
    console.log('GET Auth check - Session ID:', req.sessionID);
    console.log('GET Auth check - Session data:', req.session);
    console.log('GET Auth check - Session user:', req.session.user);
    
    if (req.session.user) {
      const user = await auth.getUserById(req.session.user.id);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        console.log('GET Returning user data:', { id: user.id, username: user.username });
        res.json(userWithoutPassword);
      } else {
        console.log('GET User not found in database for ID:', req.session.user.id);
        res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' });
      }
    } else {
      console.log('GET No session user found, session data:', req.session);
      res.status(401).json({ message: 'არ ხართ ავტორიზებული' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    const referer = req.get('Referer');
    const isProfilePage = referer && referer.includes('/profile');
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'გასვლა ვერ მოხერხდა' });
      }
      res.clearCookie('connect.sid');
      res.json({ 
        message: 'გასვლა წარმატებით დასრულდა',
        redirect: isProfilePage ? '/' : null 
      });
    });
  });

  // Google OAuth Routes
  app.get('/api/auth/google', (req, res) => {
    console.log('Google OAuth initiation requested');
    
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      return res.status(500).json({ message: 'Google OAuth არ არის კონფიგურირებული' });
    }

    const redirectUri = getRedirectUri(req);
    console.log('Initiating Google OAuth with redirect URI:', redirectUri);
    
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log('Redirecting to Google OAuth URL');
    res.redirect(authUrl);
  });

  // Test endpoint to verify callback route is accessible
  app.get('/api/auth/google/test', (req, res) => {
    console.log('Google OAuth test endpoint hit');
    res.json({ message: 'Google OAuth callback route is accessible', redirectUri: getRedirectUri(req) });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const { code, error } = req.query;

    console.log('Google OAuth callback received:', { code: !!code, error, fullQuery: req.query });

    if (error) {
      console.error('Google OAuth error in callback:', error);
      return res.redirect('/?error=google_auth_failed');
    }

    if (!code) {
      console.error('No authorization code received');
      return res.redirect('/?error=missing_code');
    }

    try {
      const redirectUri = getRedirectUri(req);
      console.log('Using redirect URI:', redirectUri);
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response status:', tokenResponse.status);

      if (tokenData.error) {
        console.error('Google token error:', tokenData.error);
        return res.redirect('/?error=token_exchange_failed');
      }

      console.log('Successfully got access token');

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userResponse.json();
      console.log('Google user data:', { email: googleUser.email, name: googleUser.name });

      if (!googleUser.email) {
        console.error('No email received from Google');
        return res.redirect('/?error=no_email');
      }

      // Create username from email (e.g., shengela06@gmail.com -> shengela06)
      const username = googleUser.email.split('@')[0];
      console.log('Generated username:', username);
      
      // Check if user exists by email
      let user = await auth.getUserByEmail(googleUser.email);
      console.log('Existing user found:', !!user);
      
      if (!user) {
        // Check if username is taken and generate unique one if needed
        let finalUsername = username;
        let counter = 1;
        
        while (await auth.isUsernameTaken(finalUsername)) {
          finalUsername = `${username}${counter}`;
          counter++;
        }

        console.log('Creating new user with username:', finalUsername);

        // Create new user
        user = await auth.createUser({
          username: finalUsername,
          email: googleUser.email,
          password: 'google_oauth_' + Math.random().toString(36).substring(7), // Random password for Google users
          phone: '', // Default empty phone for Google OAuth users
          full_name: googleUser.name || '',
        });
        
        console.log('User created successfully:', { id: user.id, username: user.username, email: user.email });
      }

      // Set user in session with complete user data
      console.log('Setting user in session...');
      console.log('Session ID before setting user:', req.sessionID);
      console.log('Session data before setting user:', req.session);
      
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };

      console.log('Session user set successfully:', req.session.user);
      console.log('Full session data after setting user:', req.session);
      console.log('Session ID after setting user:', req.sessionID);

      // Save session before redirect to ensure it's persisted
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/?error=session_failed');
        }
        
        console.log('Session saved successfully');
        console.log('Final session data after save:', req.session);
        console.log('Final session ID after save:', req.sessionID);
        console.log('Redirecting to home with login=success');
        
        // Redirect to home page
        res.redirect('/?login=success');
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/?error=auth_failed');
    }
  });
  
  // Delivery methods endpoint
  app.get("/api/delivery-methods", async (req, res) => {
    try {
      // Query delivery methods directly from the database
      const { rows } = await pool.query(`
        SELECT * FROM delivery_methods 
        WHERE is_active = true 
        ORDER BY estimated_days_min ASC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error("Error fetching delivery methods:", error);
      res.status(500).json({ message: "Error fetching delivery methods" });
    }
  });

  // API routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/popular", async (req, res) => {
    try {
      const products = await storage.getPopularProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching popular products" });
    }
  });

  app.get("/api/products/recommended", async (req, res) => {
    try {
      const products = await storage.getRecommendedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recommended products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/sliders", async (req, res) => {
    try {
      const sliders = await storage.getAllSliders();
      res.json(sliders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sliders" });
    }
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  // Create category
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // API Categories routes for hierarchical category management
  
  // Get all API categories
  app.get("/api/api-categories", async (req, res) => {
    try {
      const categories = await storage.getAllApiCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching API categories:', error);
      res.status(500).json({ message: "Failed to fetch API categories" });
    }
  });

  // Get API categories by level (0=main, 1=sub, 2=sub-sub)
  app.get("/api/api-categories/level/:level", async (req, res) => {
    try {
      const level = parseInt(req.params.level);
      const categories = await storage.getApiCategoriesByLevel(level);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching API categories by level:', error);
      res.status(500).json({ message: "Failed to fetch API categories by level" });
    }
  });

  // Get API categories by parent ID
  app.get("/api/api-categories/parent/:parentId", async (req, res) => {
    try {
      const parentId = parseInt(req.params.parentId);
      const categories = await storage.getApiCategoriesByParentId(parentId);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching API categories by parent:', error);
      res.status(500).json({ message: "Failed to fetch API categories by parent" });
    }
  });

  // Get API category by original API ID
  app.get("/api/api-categories/api/:apiId", async (req, res) => {
    try {
      const apiId = parseInt(req.params.apiId);
      const category = await storage.getApiCategoryByApiId(apiId);
      if (!category) {
        return res.status(404).json({ message: "API category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching API category by API ID:', error);
      res.status(500).json({ message: "Failed to fetch API category" });
    }
  });

  // Get featured products for mobile app (same as რეკომენდირებული section)
  app.get('/api/home/featured', async (req, res) => {
    try {
      console.log('Fetching featured products from DevMonkeys API...');
      
      // Fetch from the same endpoint used by the main website
      const response = await fetch('https://service.devmonkeys.ge/api/searchRatingListItemsBest');
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.OtapiItemInfoSubList || !data.OtapiItemInfoSubList.Content) {
        throw new Error('Invalid API response structure');
      }
      
      const apiProducts = data.OtapiItemInfoSubList.Content;
      
      if (!Array.isArray(apiProducts) || apiProducts.length === 0) {
        return res.json({ featuredProducts: [] });
      }
      
      // Process products for mobile (limit to 12 products) with database translations
      const featuredProductsPromises = apiProducts.slice(0, 12).map(async (item) => {
        // Find the main picture or use the first one
        const mainPicture = item.Pictures?.find((pic: any) => pic.IsMain === true) || 
                           (item.Pictures && item.Pictures.length > 0 ? item.Pictures[0] : null);
        
        // Extract price information using the same logic as the website
        let price = 0;
        let sign = "₾";
        let discountPercentage: number | undefined = undefined;
        let oldPrice: number | undefined = undefined;
        
        if (item.Price) {
          // Extract price using the same logic as the website
          if (item.Price.ConvertedPriceList && item.Price.ConvertedPriceList.Internal) {
            price = item.Price.ConvertedPriceList.Internal.Price || 0;
            sign = item.Price.ConvertedPriceList.Internal.Sign || "₾";
          } else if (item.Price.ConvertedPriceList?.DisplayedMoneys && 
              Array.isArray(item.Price.ConvertedPriceList.DisplayedMoneys) && 
              item.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
            // Get price from DisplayedMoneys like the website does
            const priceData = item.Price.ConvertedPriceList.DisplayedMoneys[0];
            price = priceData.Price || 0;
            sign = priceData.Sign || "₾";
          } else if (item.Price.ConvertedPriceWithoutSign) {
            price = parseFloat(item.Price.ConvertedPriceWithoutSign) || 0;
            sign = item.Price.CurrencySign || "₾";
          } else if (item.Price.OriginalPrice) {
            price = item.Price.OriginalPrice || 0;
          }
          
          // Check for discount/old price
          if (item.Price.OriginalPrice && item.Price.OriginalPrice > price) {
            oldPrice = item.Price.OriginalPrice;
          } else if (item.Price.HasSaleDiscount && item.Price.OldPrice) {
            oldPrice = parseFloat(item.Price.OldConvertedPriceWithoutSign) || 0;
          }
          
          // Calculate discount percentage if we have both prices
          if (oldPrice && oldPrice > price) {
            discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
          }
        }
        
        // Get Georgian translation from database using product_id like the website does
        // Check if ID already has tr- prefix to avoid duplication
        const productId = item.Id.toString().startsWith('tr-') ? item.Id.toString() : `tr-${item.Id}`;
        let georgianName = item.Title || 'Untitled Product';
        
        try {
          // Look up translation by product_id in the database
          const translationQuery = await db.select()
            .from(translations)
            .where(and(
              eq(translations.productId, productId),
              eq(translations.targetLanguage, 'ka')
            ))
            .limit(1);
            
          if (translationQuery.length > 0) {
            georgianName = translationQuery[0].translatedText;
          }
        } catch (translationError) {
          console.error('Translation lookup error for product', productId, ':', translationError);
        }
        
        return {
          id: item.Id.toString(),
          name: georgianName,
          georgianName: georgianName,
          price: price,
          oldPrice: oldPrice,
          discount: discountPercentage ? `${discountPercentage}%` : undefined,
          images: mainPicture ? [mainPicture.Url] : [],
          stockCount: item.StockCount || 0,
          sign: sign,
          totalSales: item.TotalSales || 0
        };
      });
      
      const featuredProducts = await Promise.all(featuredProductsPromises);
      
      console.log(`Fetched ${featuredProducts.length} featured products for mobile`);
      res.json({ featuredProducts });
      
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ 
        featuredProducts: [],
        error: 'Failed to fetch featured products' 
      });
    }
  });

  // Popular products endpoint for mobile with Georgian translations from database
  app.get('/api/home/popular', async (req, res) => {
    try {
      console.log('Fetching popular products from DevMonkeys API...');
      
      // Fetch from the popular products endpoint
      const response = await fetch('https://service.devmonkeys.ge/api/searchRatingListItemsPopular');
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.OtapiItemInfoSubList || !data.OtapiItemInfoSubList.Content) {
        throw new Error('Invalid API response structure');
      }
      
      const apiProducts = data.OtapiItemInfoSubList.Content;
      
      if (!Array.isArray(apiProducts) || apiProducts.length === 0) {
        return res.json({ popularProducts: [] });
      }
      
      // Process products for mobile (limit to 12 products) with database translations
      const popularProductsPromises = apiProducts.slice(0, 12).map(async (item) => {
        // Find the main picture or use the first one
        const mainPicture = item.Pictures?.find((pic: any) => pic.IsMain === true) || 
                           (item.Pictures && item.Pictures.length > 0 ? item.Pictures[0] : null);
        
        // Extract price information using the same logic as the featured products
        let price = 0;
        let sign = "₾";
        let discountPercentage: number | undefined = undefined;
        let oldPrice: number | undefined = undefined;
        
        // Check for promotion pricing first (discount information)
        if (item.PromotionPrice && item.PromotionPricePercent && item.PromotionPricePercent.length > 0) {
          // Use promotion price as the discounted price
          if (item.PromotionPrice.ConvertedPriceList?.Internal) {
            price = item.PromotionPrice.ConvertedPriceList.Internal.Price || 0;
            sign = item.PromotionPrice.ConvertedPriceList.Internal.Sign || "₾";
          }
          
          // Get original price from DisplayedMoneys to calculate the discount
          if (item.Price?.ConvertedPriceList?.DisplayedMoneys && item.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
            const originalPriceObj = item.Price.ConvertedPriceList.DisplayedMoneys[0];
            oldPrice = originalPriceObj.Price;
            
            // Calculate the discount percentage
            if (oldPrice && oldPrice > 0 && price < oldPrice) {
              discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
            }
          }
        } else {
          // No promotion, use regular price from Price.ConvertedPriceList.DisplayedMoneys
          if (item.Price?.ConvertedPriceList?.DisplayedMoneys && item.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
            const priceObj = item.Price.ConvertedPriceList.DisplayedMoneys[0];
            price = priceObj.Price || 0;
            sign = priceObj.Sign || "₾";
          } else if (item.Price?.ConvertedPriceList?.Price) {
            // Fallback to the old structure
            price = item.Price.ConvertedPriceList.Price || 0;
            sign = item.Price.ConvertedPriceList.Sign || "₾";
          }
        }
        
        // Get Georgian translation from database using product_id like the website does
        // Check if ID already has tr- prefix to avoid duplication
        const productId = item.Id.toString().startsWith('tr-') ? item.Id.toString() : `tr-${item.Id}`;
        let georgianName = item.Title || 'Untitled Product';
        
        try {
          // Look up translation by product_id in the database
          const translationQuery = await db.select()
            .from(translations)
            .where(and(
              eq(translations.productId, productId),
              eq(translations.targetLanguage, 'ka')
            ))
            .limit(1);
            
          if (translationQuery.length > 0) {
            georgianName = translationQuery[0].translatedText;
          }
        } catch (translationError) {
          console.error('Translation lookup error for product', productId, ':', translationError);
        }
        
        return {
          id: item.Id.toString(),
          name: georgianName,
          georgianName: georgianName,
          price: price,
          oldPrice: oldPrice,
          discount: discountPercentage ? `${discountPercentage}%` : undefined,
          images: mainPicture ? [mainPicture.Url] : [],
          stockCount: item.StockCount || 0,
          sign: sign,
          totalSales: item.TotalSales || 0
        };
      });
      
      const popularProducts = await Promise.all(popularProductsPromises);
      
      console.log(`Fetched ${popularProducts.length} popular products for mobile`);
      res.json({ popularProducts });
      
    } catch (error) {
      console.error('Error fetching popular products:', error);
      res.status(500).json({ 
        popularProducts: [],
        error: 'Failed to fetch popular products' 
      });
    }
  });

  // Create single API category
  app.post("/api/api-categories", async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createApiCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating API category:', error);
      res.status(400).json({ message: "Failed to create API category" });
    }
  });

  // Bulk insert API categories (for initial data population)
  app.post("/api/api-categories/bulk", async (req, res) => {
    try {
      const { categories } = req.body;
      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: "Categories must be an array" });
      }
      
      const newCategories = await storage.bulkInsertApiCategories(categories);
      res.status(201).json({ 
        message: `Successfully inserted ${newCategories.length} categories`,
        categories: newCategories 
      });
    } catch (error) {
      console.error('Error bulk inserting API categories:', error);
      res.status(400).json({ message: "Failed to bulk insert API categories" });
    }
  });

  // Update API category
  app.put("/api/api-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = req.body;
      const updatedCategory = await storage.updateApiCategory(id, categoryData);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating API category:', error);
      res.status(400).json({ message: "Failed to update API category" });
    }
  });

  // Delete API category
  app.delete("/api/api-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApiCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "API category not found" });
      }
      res.json({ message: "API category deleted successfully" });
    } catch (error) {
      console.error('Error deleting API category:', error);
      res.status(500).json({ message: "Failed to delete API category" });
    }
  });

  // Endpoint to fetch and store categories from external API
  app.post("/api/api-categories/sync-from-api", async (req, res) => {
    try {
      // This endpoint will be used to fetch categories from the external API
      // and store them in the database with proper hierarchy
      const { apiUrl, apiKey } = req.body;
      
      if (!apiUrl) {
        return res.status(400).json({ message: "API URL is required" });
      }

      // Fetch categories from external API
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // Process and structure the hierarchical data
      const processedCategories = [];
      
      // Assuming the API returns categories in a hierarchical structure
      // We'll need to flatten them and assign proper levels and parent relationships
      const processCategory = (category: any, level: number = 0, parentId: number | null = null) => {
        const processedCategory = {
          apiId: category.id,
          name: category.name || category.title,
          parentId,
          level,
          isActive: true
        };
        
        processedCategories.push(processedCategory);
        
        // Process subcategories if they exist
        if (category.children && Array.isArray(category.children)) {
          category.children.forEach((child: any) => {
            processCategory(child, level + 1, category.id);
          });
        }
      };

      // Process all top-level categories
      if (Array.isArray(apiData)) {
        apiData.forEach(category => processCategory(category));
      } else if (apiData.categories && Array.isArray(apiData.categories)) {
        apiData.categories.forEach(category => processCategory(category));
      }

      // Insert categories into database
      const insertedCategories = await storage.bulkInsertApiCategories(processedCategories);
      
      res.json({
        message: `Successfully synced ${insertedCategories.length} categories from API`,
        categories: insertedCategories
      });
      
    } catch (error) {
      console.error('Error syncing categories from API:', error);
      res.status(500).json({ message: "Failed to sync categories from API" });
    }
  });

  // Create slider
  app.post("/api/sliders", async (req, res) => {
    try {
      const sliderData = insertSliderSchema.parse(req.body);
      const slider = await storage.createSlider(sliderData);
      res.status(201).json(slider);
    } catch (error) {
      res.status(400).json({ message: "Invalid slider data" });
    }
  });

  // Authentication routes
  
  // User Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Create a more specific registration schema with validation
      const registerSchema = insertUserSchema.extend({
        email: z.string().email({ message: "არასწორი ელფოსტის ფორმატი" }),
        username: z.string().min(3, { message: "მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს" }),
        password: z.string().min(6, { message: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" }),
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "პაროლები არ ემთხვევა",
        path: ["confirmPassword"]
      });
    
      // Parse and validate input
      const userData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const isUsernameTaken = await storage.isUsernameTaken(userData.username);
      if (isUsernameTaken) {
        return res.status(400).json({ message: "მომხმარებლის სახელი უკვე დაკავებულია" });
      }
      
      const isEmailTaken = await storage.isEmailTaken(userData.email);
      if (isEmailTaken) {
        return res.status(400).json({ message: "ელფოსტა უკვე გამოყენებულია" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user (without confirmPassword field)
      const { confirmPassword, ...userToCreate } = userData;
      const newUser = await storage.createUser({
        ...userToCreate,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      // Set session
      req.session.user = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      };
      
      // Return user data (without password)
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => err.message).join(", ");
        return res.status(400).json({ message: errorMessage });
      }
      res.status(500).json({ message: "რეგისტრაციის დროს დაფიქსირდა შეცდომა" });
    }
  });
  
  // User Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: "შეავსეთ ყველა ველი" });
      }
      
      // Find user by username or email
      const user = await storage.getUserByUsernameOrEmail(usernameOrEmail);
      
      if (!user) {
        return res.status(400).json({ message: "არასწორი მომხმარებლის სახელი/ელფოსტა ან პაროლი" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "არასწორი მომხმარებლის სახელი/ელფოსტა ან პაროლი" });
      }
      
      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "ავტორიზაციის დროს დაფიქსირდა შეცდომა" });
    }
  });
  
  // Get current user (if logged in)
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
    }
    
    try {
      // Fetch latest user data including balance and other user info
      const userData = await storage.getUserById(req.session.user.id);
      
      if (!userData) {
        // User no longer exists, clear session
        req.session.destroy(() => {});
        return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
      }
      
      // Update session with fresh user data
      req.session.user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        balance: userData.balance
      };
      
      return res.json(userData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return res.json(req.session.user); // Return at least the session data
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "გასვლის დროს დაფიქსირდა შეცდომა" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "წარმატებით გახვედით სისტემიდან" });
    });
  });
  
  // Cart operations
  app.post("/api/cart/add", async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      // Use session user ID if authenticated, otherwise use 'guest'
      const userId = req.session.user ? req.session.user.id.toString() : 'guest';
      
      const cart = await storage.addToCart(userId, productId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: "Could not add to cart" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string || 'guest';
      const cart = await storage.getCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // In a real app, you would store this in a database
      console.log(`New newsletter subscription: ${email}`);
      
      res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error processing subscription" });
    }
  });
  
  // Image upload for search functionality
  app.post("/api/upload-image", uploadImageHandler);
  
  // Dynamic sitemap generation
  app.get("/sitemap.xml", generateSitemap);
  
  // Update user profile
  app.post("/api/user/update", isAuthenticated, async (req, res) => {
    try {
      const { full_name, email, phone, address } = req.body;
      
      // Use the authenticated user's ID from session
      const id = req.session.user!.id;
      
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "ეს ელ-ფოსტა უკვე გამოყენებულია" });
        }
      }
      
      // Update user in the database
      const updatedUser = await storage.updateUser(id, {
        full_name,
        email,
        phone,
        address
      });
      
      // Update session with new user data
      req.session.user = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name
      };
      
      res.json({
        message: "პროფილი განახლებულია",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          balance_code: updatedUser.balance_code,
          balance: updatedUser.balance
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "შეცდომა პროფილის განახლებისას" });
    }
  });
  
  // Change user password
  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { id, currentPassword, newPassword } = req.body;
      
      // Validate user is changing their own password
      if (req.session.user?.id !== id) {
        return res.status(403).json({ message: "არ გაქვთ ამ ოპერაციის უფლება" });
      }
      
      // Get user from database
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
      }
      
      // Validate current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "მიმდინარე პაროლი არასწორია" });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await storage.updateUserPassword(id, hashedPassword);
      
      res.json({
        message: "პაროლი წარმატებით შეიცვალა"
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "შეცდომა პაროლის შეცვლისას" });
    }
  });

  // User Addresses Routes
  
  // Get user addresses
  app.get("/api/user/addresses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const addresses = await storage.getAddressesByUserId(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "მისამართების ჩატვირთვა ვერ მოხერხდა" });
    }
  });
  
  // Create new address
  app.post("/api/user/addresses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const addressData = {
        ...req.body,
        user_id: userId
      };
      
      const newAddress = await storage.createAddress(addressData);
      
      // If address is set as default, update user's default address
      if (addressData.is_default) {
        await storage.setDefaultAddress(userId, newAddress.id);
      }
      
      res.status(201).json(newAddress);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "მისამართის დამატება ვერ მოხერხდა" });
    }
  });
  
  // Update address
  app.put("/api/user/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const userId = req.session.user!.id;
      
      // Check if address belongs to user
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "მისამართი ვერ მოიძებნა" });
      }
      
      if (address.user_id !== userId) {
        return res.status(403).json({ message: "არ გაქვთ ამ მისამართის რედაქტირების უფლება" });
      }
      
      const updatedAddress = await storage.updateAddress(addressId, req.body);
      
      // If address is set as default, update user's default address
      if (req.body.is_default) {
        await storage.setDefaultAddress(userId, addressId);
      }
      
      res.json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "მისამართის განახლება ვერ მოხერხდა" });
    }
  });
  
  // Delete address
  app.delete("/api/user/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const userId = req.session.user!.id;
      
      // Check if address belongs to user
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "მისამართი ვერ მოიძებნა" });
      }
      
      if (address.user_id !== userId) {
        return res.status(403).json({ message: "არ გაქვთ ამ მისამართის წაშლის უფლება" });
      }
      
      const result = await storage.deleteAddress(addressId);
      
      if (result) {
        res.json({ success: true, message: "მისამართი წაიშალა" });
      } else {
        res.status(500).json({ message: "მისამართის წაშლა ვერ მოხერხდა" });
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "მისამართის წაშლა ვერ მოხერხდა" });
    }
  });
  
  // Set default address
  app.post("/api/user/addresses/:id/default", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const userId = req.session.user!.id;
      
      // Check if address belongs to user
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "მისამართი ვერ მოიძებნა" });
      }
      
      if (address.user_id !== userId) {
        return res.status(403).json({ message: "არ გაქვთ ამ მისამართის დაყენების უფლება" });
      }
      
      await storage.setDefaultAddress(userId, addressId);
      
      res.json({ success: true, message: "ნაგულისხმევი მისამართი დაყენებულია" });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ message: "ნაგულისხმევი მისამართის დაყენება ვერ მოხერხდა" });
    }
  });

  // Get user's delivery tracking data
  app.get('/api/user/delivery-tracking', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      
      console.log('Delivery tracking request - User ID:', userId);
      console.log('Session:', req.session);
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get all delivery tracking data for user's orders using SQL query
      const result = await pool.query(`
        SELECT 
          dt.id,
          dt.order_id,
          dt.delivery_status,
          dt.tracking_number,
          dt.product_weight,
          dt.transportation_price,
          dt.ordered_at,
          dt.received_china_at,
          dt.sent_tbilisi_at,
          dt.delivered_tbilisi_at,
          dt.notes,
          dt.created_at,
          dt.updated_at
        FROM delivery_tracking dt
        INNER JOIN orders o ON dt.order_id = o.id
        WHERE o.user_id = $1
        ORDER BY dt.updated_at DESC
      `, [userId]);

      console.log('Delivery tracking query result:', result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user delivery tracking:', error);
      res.status(500).json({ error: 'Failed to fetch delivery tracking data' });
    }
  });

  // Order endpoints
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      console.log('Fetching orders for user:', userId);
      const orders = await storage.getOrdersByUserId(userId);
      console.log('Found orders:', orders.length);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "შეცდომა შეკვეთების მოძიებისას" });
    }
  });

  // Get order by external ID (for payment success page)
  app.get("/api/orders/by-external-id/:externalId", isAuthenticated, async (req, res) => {
    try {
      console.log('External ID endpoint - Session user:', req.session.user);
      console.log('External ID endpoint - Session user ID:', req.session.user?.id);
      
      const userId = req.session.user?.id;
      if (!userId) {
        console.log('No user ID found in session');
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const externalId = req.params.externalId;
      console.log('Fetching order by external ID:', externalId, 'for user:', userId);

      // Query the database for order with this external ID and user ID
      const [order] = await db.select()
        .from(orders)
        .where(and(
          eq(orders.externalOrderId, externalId),
          eq(orders.userId, userId)
        ));

      if (!order) {
        console.log('Order not found for external ID:', externalId);
        return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
      }

      console.log('Found order:', order.id, 'with status:', order.status);
      res.json(order);
    } catch (error) {
      console.error("Error fetching order by external ID:", error);
      res.status(500).json({ message: "შეკვეთის მიღება ვერ მოხერხდა" });
    }
  });

  // Send order success SMS notification
  app.post("/api/orders/send-success-sms/:externalId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const externalId = req.params.externalId;
      console.log('Sending success SMS for order:', externalId);

      // Get the order details
      const [order] = await db.select()
        .from(orders)
        .where(and(
          eq(orders.externalOrderId, externalId),
          eq(orders.userId, userId)
        ));

      if (!order) {
        return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
      }

      // Check if SMS has already been sent for this order
      if (order.smsNotificationSent) {
        console.log('SMS already sent for order:', externalId);
        return res.json({ 
          success: true, 
          message: "SMS უკვე გაიგზავნა ამ შეკვეთისთვის",
          alreadySent: true 
        });
      }

      if (!order.recipientPhone) {
        return res.status(400).json({ message: "ტელეფონის ნომერი არ არის მითითებული" });
      }

      // Format the amount properly (convert from tetri to lari)
      const totalAmountLari = (order.totalAmount / 100).toFixed(2);

      // Create SMS message in Georgian
      const smsMessage = `🎉 GAMOIWERE.GE

თქვენი შეკვეთა წარმატებით დადასტურდა!

📦 შეკვეთის ნომერი: ${order.orderNumber}
💰 თანხა: ${totalAmountLari} ₾
✅ სტატუსი: გადახდილი

ჩვენ მალე დაგიკავშირდებით მიწოდების დეტალებისთვის.

მადლობა, რომ ირჩევთ ჩვენს სერვისს!

GAMOIWERE.GE`;

      // Send SMS using existing SMS service
      const smsResult = await smsService.sendSms({
        to: order.recipientPhone,
        message: smsMessage
      });

      if (smsResult.success) {
        // Mark the order as having SMS notification sent
        await db.update(orders)
          .set({ smsNotificationSent: true })
          .where(eq(orders.id, order.id));

        console.log('Success SMS sent successfully to:', order.recipientPhone);
        res.json({ 
          success: true, 
          message: "SMS გაიგზავნა წარმატებით",
          messageId: smsResult.messageId 
        });
      } else {
        console.error('Failed to send success SMS:', smsResult.error);
        res.status(500).json({ 
          success: false, 
          message: "SMS-ის გაგზავნა ვერ მოხერხდა",
          error: smsResult.error 
        });
      }

    } catch (error) {
      console.error("Error sending success SMS:", error);
      res.status(500).json({ message: "SMS-ის გაგზავნა ვერ მოხერხდა" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.session.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
      }
      
      // Verify that the order belongs to the authenticated user
      if (order.userId !== userId) {
        return res.status(403).json({ message: "არ გაქვთ უფლება ნახოთ ეს შეკვეთა" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "შეცდომა შეკვეთის მოძიებისას" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const { items, shippingAddress, totalAmount } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "შეკვეთაში უნდა იყოს მინიმუმ ერთი პროდუქტი" });
      }

      // Convert item prices from GEL to tetri (multiply by 100)
      const processedItems = items.map(item => ({
        ...item,
        price: Math.round(item.price * 100) // Convert GEL to tetri
      }));
      
      if (!shippingAddress) {
        return res.status(400).json({ message: "მიუთითეთ მიწოდების მისამართი" });
      }

      if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({ message: "შეკვეთის ჯამური თანხა არასწორია" });
      }

      // Generate a unique order number using BOG-compatible format
      const timestamp = Date.now();
      const orderNumber = `GAM-${timestamp}-${userId}`;
      
      // Calculate estimated delivery date based on delivery method
      let estimatedDeliveryDate = new Date();
      if (req.body.deliveryMethod === 'AIR') {
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 14); // 14 days for air
      } else if (req.body.deliveryMethod === 'GROUND') {
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 30); // 30 days for ground
      } else if (req.body.deliveryMethod === 'SEA') {
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 45); // 45 days for sea
      }
      
      // Create new order
      const newOrder = await storage.createOrder({
        userId,
        orderNumber,
        status: "PENDING",
        items: processedItems, // Use processed items with converted prices
        shippingAddress,
        totalAmount: Math.round(totalAmount * 100), // Convert GEL to tetri (multiply by 100)
        paymentMethod: req.body.paymentMethod || "BANK_TRANSFER",
        deliveryMethod: req.body.deliveryMethod,
        estimatedDeliveryDate,
        shippingCity: req.body.shippingCity,
        shippingPostalCode: req.body.shippingPostalCode,
        recipientName: req.body.recipientName,
        recipientPhone: req.body.recipientPhone,
        notes: req.body.notes || null
      });

      // Send order confirmation email
      try {
        const user = await storage.getUserById(userId);
        if (user) {
          const emailSent = await orderEmailService.sendOrderConfirmationEmail(newOrder, user);
          
          if (emailSent) {
            console.log(`Order confirmation email sent successfully to ${user.email} for order ${newOrder.orderNumber}`);
          } else {
            console.log(`Failed to send order confirmation email to ${user.email} for order ${newOrder.orderNumber}`);
          }
        }
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail order creation if email fails
      }

      // Send SMS notification for new order
      try {
        const user = await storage.getUserById(userId);
        if (user && user.phone) {
          // Format order items for SMS
          const itemsList = newOrder.items.map((item: any) => 
            `${item.name} x${item.quantity}`
          ).join(', ');
          
          // Create delivery method text
          const deliveryMethodText = 
            newOrder.deliveryMethod === 'AIR' ? 'ავიაგზავნილი' :
            newOrder.deliveryMethod === 'GROUND' ? 'სახმელეთო' :
            newOrder.deliveryMethod === 'SEA' ? 'საზღვაო' : 'სტანდარტული';
          
          // Create status text in Georgian
          const statusText = 
            newOrder.status === 'PENDING' ? 'მოლოდინში' :
            newOrder.status === 'PROCESSING' ? 'დამუშავებაში' :
            newOrder.status === 'PAID' ? 'გადახდილი' :
            newOrder.status === 'SHIPPED' ? 'გაგზავნილი' :
            newOrder.status === 'DELIVERED' ? 'ჩაბარებული' : 'გაუქმებული';

          const smsMessage = `თქვენი შეკვეთა მიღებულია! შეკვეთის №: ${newOrder.orderNumber}, სტატუსი: ${statusText}. მადლობა, რომ ირჩევთ GAMOIWERE.GE-ს!`;

          const smsSent = await smsService.sendSms({
            to: user.phone,
            message: smsMessage
          });
          
          if (smsSent.success) {
            console.log(`Order SMS notification sent successfully to ${user.phone} for order ${newOrder.orderNumber}`);
          } else {
            console.log(`Failed to send order SMS notification to ${user.phone} for order ${newOrder.orderNumber}:`, smsSent.error);
          }
        } else {
          console.log(`No phone number available for user ${userId}, skipping SMS notification`);
        }
      } catch (smsError) {
        console.error('Error sending order SMS notification:', smsError);
        // Don't fail order creation if SMS fails
      }

      res.status(201).json({
        message: "შეკვეთა წარმატებით შეიქმნა",
        order: newOrder
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "შეცდომა შეკვეთის შექმნისას" });
    }
  });

  // Payment endpoints
  app.post("/api/payments/bank-transfer", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const { orderId, amount, payerName } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "შეკვეთის ID აუცილებელია" });
      }
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "გადახდის თანხა არასწორია" });
      }

      // Fetch the order to check if it belongs to the user
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
      }
      
      if (order.userId !== userId) {
        return res.status(403).json({ message: "არ გაქვთ უფლება გადაიხადოთ სხვისი შეკვეთა" });
      }
      
      if (order.status !== "PENDING") {
        return res.status(400).json({ message: "შეკვეთის სტატუსი არ არის მოლოდინში" });
      }

      // Create bank transfer payment
      const bankDetails = {
        bankName: "Bank of Georgia",
        accountName: "GAMOIWERE LLC",
        accountNumber: "GE123456789012345678",
        swiftCode: "BAGAGE22"
      };

      const payment = await storage.createPayment({
        orderId,
        amount,
        method: "BANK_TRANSFER",
        status: "PENDING",
        payerName: payerName || null,
        notes: req.body.notes || null,
        transactionId: null,
        bankDetails
      });

      // Update order status to PROCESSING
      await storage.updateOrderStatus(orderId, "PROCESSING");

      res.status(201).json({
        message: "საბანკო გადარიცხვა წარმატებით დაფიქსირდა",
        payment,
        bankDetails
      });
    } catch (error) {
      console.error("Error creating bank transfer payment:", error);
      res.status(500).json({ message: "შეცდომა საბანკო გადარიცხვის შექმნისას" });
    }
  });

  // Balance payment endpoint
  app.post("/api/payments/balance", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "არ ხართ ავტორიზებული" });
      }

      const { orderId, amount } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "შეკვეთის ID აუცილებელია" });
      }
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "გადახდის თანხა არასწორია" });
      }

      // Fetch the order to check if it belongs to the user
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "შეკვეთა ვერ მოიძებნა" });
      }
      
      if (order.userId !== userId) {
        return res.status(403).json({ message: "არ გაქვთ უფლება გადაიხადოთ სხვისი შეკვეთა" });
      }
      
      if (order.status !== "PENDING" && order.status !== "PROCESSING") {
        return res.status(400).json({ message: "შეკვეთის სტატუსი არ არის მოლოდინში ან დამუშავებაში" });
      }

      // Check user balance
      const user = await storage.getUserById(userId);
      if (!user || user.balance === null || user.balance < Number(amount)) {
        return res.status(400).json({ message: "არასაკმარისი ბალანსი" });
      }

      // Create balance payment
      const payment = await storage.createPayment({
        orderId,
        amount,
        method: "BALANCE",
        status: "PAID", // Balance payments are instantly confirmed
        notes: "გადახდილია ანგარიშის ბალანსიდან",
      });

      // Update user balance
      const newBalance = user.balance - Number(amount);
      await storage.updateUser(userId, { balance: newBalance });

      // Determine if order is fully paid
      const isFullyPaid = Number(amount) >= order.totalAmount;
      const newOrderStatus = isFullyPaid ? "PAID" : "PROCESSING";
      
      // Update order status
      await storage.updateOrderStatus(orderId, newOrderStatus);

      res.status(201).json({
        message: "ბალანსით გადახდა წარმატებით განხორციელდა",
        payment,
        newBalance,
        fullyPaid: isFullyPaid,
        remainingAmount: isFullyPaid ? 0 : (order.totalAmount - Number(amount)),
        newOrderStatus
      });
    } catch (error) {
      console.error("Error processing balance payment:", error);
      res.status(500).json({ message: "შეცდომა ბალანსით გადახდისას" });
    }
  });

  // Endpoint for admin to confirm bank transfer payment
  app.post("/api/payments/bank-transfer/:id/confirm", isAuthenticated, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const transactionId = req.body.transactionId;
      
      if (!transactionId) {
        return res.status(400).json({ message: "ტრანზაქციის ID აუცილებელია" });
      }

      // In a real application, we'd check if the user is an admin here
      // For now, we'll just allow any authenticated user to confirm payments for demo purposes
      
      // Get the payment
      const payment = await storage.getPaymentById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ message: "გადახდა ვერ მოიძებნა" });
      }
      
      if (payment.status === "PAID") {
        return res.status(400).json({ message: "გადახდა უკვე დადასტურებულია" });
      }

      // Update payment status and transaction ID
      const updatedPayment = await storage.updatePaymentStatus(paymentId, "PAID");
      
      // Update order status to PAID
      await storage.updateOrderStatus(payment.orderId, "PAID");

      res.json({
        message: "გადახდა წარმატებით დადასტურდა",
        payment: updatedPayment
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "შეცდომა გადახდის დადასტურებისას" });
    }
  });

  // Search keyword endpoints
  app.get("/api/search-keywords", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const keywords = await storage.getRecentSearchKeywords(limit);
      res.json(keywords);
    } catch (error) {
      console.error("Error fetching search keywords:", error);
      res.status(500).json({ message: "შეცდომა ძიების ისტორიის მიღებისას" });
    }
  });

  app.post("/api/search-keywords/track", async (req, res) => {
    try {
      const { keyword, searchUrl } = req.body;
      
      if (!keyword || !searchUrl) {
        return res.status(400).json({ message: "საძიებო სიტყვა და URL აუცილებელია" });
      }

      const trackedKeyword = await storage.trackSearch(keyword, searchUrl);
      res.json(trackedKeyword);
    } catch (error) {
      console.error("Error tracking search:", error);
      res.status(500).json({ message: "შეცდომა ძიების აღრიცხვისას" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const favorites = await storage.getFavoritesByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "რჩეულების ჩატვირთვა ვერ მოხერხდა" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const { productId, productTitle, productImage, productPrice, productUrl } = req.body;
      
      if (!productId || !productTitle) {
        return res.status(400).json({ message: "პროდუქტის ID და სათაური აუცილებელია" });
      }

      const favorite = await storage.addToFavorites(userId, {
        productId,
        productTitle,
        productImage,
        productPrice: productPrice || 0,
        productUrl
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "რჩეულებში დამატება ვერ მოხერხდა" });
    }
  });

  app.delete("/api/favorites/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const productId = req.params.productId;
      
      const removed = await storage.removeFromFavorites(userId, productId);
      
      if (removed) {
        res.json({ message: "რჩეულებიდან წარმატებით მოიშალა" });
      } else {
        res.status(404).json({ message: "პროდუქტი რჩეულებში ვერ მოიძებნა" });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "რჩეულებიდან მოშლა ვერ მოხერხდა" });
    }
  });

  app.get("/api/favorites/:productId/check", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const productId = req.params.productId;
      
      const isFavorite = await storage.isFavorite(userId, productId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "რჩეული სტატუსის შემოწმება ვერ მოხერხდა" });
    }
  });

  // Admin users management endpoints
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Calculate effective balance including pending orders for each user
      const usersWithEffectiveBalance = await Promise.all(
        allUsers.map(async (user) => {
          try {
            // Get pending orders for this user
            const pendingOrdersQuery = `
              SELECT COALESCE(SUM(total_amount), 0) as pending_amount
              FROM orders 
              WHERE user_id = $1 AND status = 'PENDING'
            `;
            const pendingResult = await pool.query(pendingOrdersQuery, [user.id]);
            const pendingAmount = parseInt(pendingResult.rows[0].pending_amount) || 0;
            
            // Calculate effective balance: current balance - pending orders
            const effectiveBalance = (user.balance || 0) - pendingAmount;
            
            return {
              ...user,
              effectiveBalance,
              pendingOrdersAmount: pendingAmount
            };
          } catch (error) {
            console.error(`Error calculating balance for user ${user.id}:`, error);
            return {
              ...user,
              effectiveBalance: user.balance || 0,
              pendingOrdersAmount: 0
            };
          }
        })
      );
      
      res.json(usersWithEffectiveBalance);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "მომხმარებლების მიღება ვერ მოხერხდა" });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Remove id from update data to prevent conflicts
      delete updateData.id;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "მომხმარებლის განახლება ვერ მოხერხდა" });
    }
  });

  // Create new user endpoint
  app.post('/api/admin/users/create', isAdmin, async (req, res) => {
    try {
      const { username, email, password, full_name, phone, address, role, balance } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({ message: "მომხმარებლის სახელი, ელ. ფოსტა და პაროლი აუცილებელია" });
      }

      // Check if username already exists
      const existingUsername = await storage.isUsernameTaken(username);
      if (existingUsername) {
        return res.status(400).json({ message: "მომხმარებლის სახელი უკვე გამოიყენება" });
      }

      // Check if email already exists
      const existingEmail = await storage.isEmailTaken(email);
      if (existingEmail) {
        return res.status(400).json({ message: "ელ. ფოსტა უკვე გამოიყენება" });
      }

      // Create user with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        full_name: full_name || null,
        phone: phone || null,
        address: address || null,
        role: role || 'user',
        balance: balance || 0,
        balance_code: null
      });

      // Send welcome email via Mailchimp
      try {
        const emailSent = await sendWelcomeEmail({
          email: newUser.email,
          firstName: newUser.full_name || newUser.username,
          lastName: '', // Admin created users might not have last name
          username: newUser.username
        });
        
        if (emailSent) {
          console.log(`Welcome email sent successfully to ${newUser.email} (admin created)`);
        } else {
          console.log(`Failed to send welcome email to ${newUser.email} (admin created)`);
        }
      } catch (emailError) {
        console.error('Error sending welcome email (admin created):', emailError);
        // Don't fail user creation if email fails
      }

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "მომხმარებლის შექმნა ვერ მოხერხდა" });
    }
  });

  // Admin - Delete user
  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "არასწორი მომხმარებლის ID" });
      }

      // Check if user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
      }

      // Prevent deleting admin users (optional safety check)
      if (user.role === 'admin') {
        return res.status(403).json({ message: "ადმინისტრატორის წაშლა დაუშვებელია" });
      }

      // Delete user
      const success = await storage.deleteUser(userId);
      
      if (success) {
        res.json({ message: "მომხმარებელი წარმატებით წაიშალა" });
      } else {
        res.status(500).json({ message: "მომხმარებლის წაშლა ვერ მოხერხდა" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "სერვერის შეცდომა" });
    }
  });

  // Test Mailchimp connection endpoint
  app.get("/api/admin/test-mailchimp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const isConnected = await testMailchimpConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? "Mailchimp connection successful" : "Mailchimp connection failed"
      });
    } catch (error) {
      console.error("Error testing Mailchimp connection:", error);
      res.status(500).json({ 
        connected: false,
        message: "Error testing Mailchimp connection"
      });
    }
  });

  // Admin statistics endpoint
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get counts directly from database without using potentially problematic methods
      let usersCount = 0;
      let productsCount = 0;
      let ordersCount = 0;
      let totalRevenue = 0;

      try {
        const allUsers = await storage.getAllUsers();
        usersCount = Array.isArray(allUsers) ? allUsers.length : 0;
      } catch (error) {
        console.log("Could not fetch users count:", error.message);
      }

      try {
        // Use a direct query for products count to avoid schema issues
        const productCountResult = await db.select({ count: sql`count(*)::int` }).from(products);
        productsCount = productCountResult[0]?.count || 0;
      } catch (error) {
        console.log("Could not fetch products count:", error.message);
      }

      try {
        const allOrders = await storage.getAllOrders();
        ordersCount = Array.isArray(allOrders) ? allOrders.length : 0;
        
        // Calculate total revenue from orders
        totalRevenue = Array.isArray(allOrders) ? 
          allOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0) : 0;
      } catch (error) {
        console.log("Could not fetch orders count:", error.message);
      }
      
      res.json({
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      res.status(500).json({ message: "სტატისტიკის მიღება ვერ მოხერხდა" });
    }
  });

  // Admin recent activities endpoint
  app.get('/api/admin/activities', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activities = [];
      
      // Get recent orders (last 10)
      const orders = await storage.getAllOrders();
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);
      
      recentOrders.forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          message: `ახალი შეკვეთა მიღებულია #${order.orderNumber}`,
          timestamp: order.createdAt,
          status: order.status
        });
      });

      // Get recent users (last 5)
      const users = await storage.getAllUsers();
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3);
      
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          message: `ახალი მომხმარებელი დარეგისტრირდა: ${user.username}`,
          timestamp: user.createdAt,
          status: 'active'
        });
      });

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      
      res.json(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      res.status(500).json({ message: 'ბოლო აქტივობების მიღება ვერ მოხერხდა' });
    }
  });

  // Service status monitoring endpoint
  app.get('/api/admin/service-status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const services = [];

      // Check DevMonkeys API
      try {
        const startTime = Date.now();
        const devMonkeysResponse = await fetch('https://service.devmonkeys.ge/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        const responseTime = Date.now() - startTime;
        services.push({
          name: 'DevMonkeys API',
          url: 'service.devmonkeys.ge',
          status: devMonkeysResponse.ok ? 'online' : 'offline',
          responseTime: responseTime,
          lastChecked: new Date()
        });
      } catch (error) {
        services.push({
          name: 'DevMonkeys API',
          url: 'service.devmonkeys.ge',
          status: 'offline',
          responseTime: null,
          lastChecked: new Date(),
          error: 'Connection failed'
        });
      }

      // Check OpenAI API
      try {
        if (process.env.OPENAI_API_KEY) {
          const startTime = Date.now();
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          });
          const responseTime = Date.now() - startTime;
          services.push({
            name: 'OpenAI API',
            url: 'api.openai.com',
            status: openaiResponse.ok ? 'online' : 'offline',
            responseTime: responseTime,
            lastChecked: new Date()
          });
        } else {
          services.push({
            name: 'OpenAI API',
            url: 'api.openai.com',
            status: 'error',
            responseTime: null,
            lastChecked: new Date(),
            error: 'API key not configured'
          });
        }
      } catch (error) {
        services.push({
          name: 'OpenAI API',
          url: 'api.openai.com',
          status: 'offline',
          responseTime: null,
          lastChecked: new Date(),
          error: 'Connection failed'
        });
      }

      // Check Database connectivity
      try {
        const startTime = Date.now();
        await storage.getAllUsers();
        const responseTime = Date.now() - startTime;
        services.push({
          name: 'Database',
          url: 'PostgreSQL',
          status: 'online',
          responseTime: responseTime,
          lastChecked: new Date()
        });
      } catch (error) {
        services.push({
          name: 'Database',
          url: 'PostgreSQL',
          status: 'offline',
          responseTime: null,
          lastChecked: new Date(),
          error: 'Database connection failed'
        });
      }

      // Check Gmail Service
      try {
        const startTime = Date.now();
        const isConnected = await gmailService.verifyConnection();
        const responseTime = Date.now() - startTime;
        services.push({
          name: 'Gmail SMTP',
          url: 'smtp.gmail.com',
          status: isConnected ? 'online' : 'offline',
          responseTime: responseTime,
          lastChecked: new Date()
        });
      } catch (error) {
        services.push({
          name: 'Gmail SMTP',
          url: 'smtp.gmail.com',
          status: 'offline',
          responseTime: null,
          lastChecked: new Date(),
          error: 'Gmail connection failed'
        });
      }

      // Check SMS Service
      try {
        const startTime = Date.now();
        const balanceResult = await smsService.checkBalance();
        const responseTime = Date.now() - startTime;
        services.push({
          name: 'SMS Office API',
          url: 'smsoffice.ge',
          status: balanceResult.success ? 'online' : 'offline',
          responseTime: responseTime,
          lastChecked: new Date(),
          details: balanceResult.success ? `ბალანსი: ${balanceResult.balance} SMS` : balanceResult.error
        });
      } catch (error) {
        services.push({
          name: 'SMS Office API',
          url: 'smsoffice.ge',
          status: 'offline',
          responseTime: null,
          lastChecked: new Date(),
          error: 'SMS service connection failed'
        });
      }

      res.json(services);
    } catch (error) {
      console.error('Error checking service status:', error);
      res.status(500).json({ message: 'სერვისების სტატუსის შემოწმება ვერ მოხერხდა' });
    }
  });

  // Site statistics endpoint
  app.get('/api/admin/site-statistics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // User statistics
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
          COUNT(CASE WHEN verification_status = 'unverified' THEN 1 END) as unverified,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
        FROM users
      `;
      const userStats = await pool.query(userStatsQuery);

      // Order statistics
      const orderStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid,
          COUNT(CASE WHEN status = 'SHIPPED' THEN 1 END) as shipped,
          COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) as refunded,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as average_order_value,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as this_month,
          COUNT(CASE WHEN created_at >= $2 THEN 1 END) as this_week
        FROM orders
      `;
      const orderStats = await pool.query(orderStatsQuery, [startOfMonth, startOfWeek]);

      // Favorites statistics
      const favoritesQuery = `
        SELECT 
          COUNT(*) as total_favorites,
          COUNT(DISTINCT product_id) as unique_products
        FROM favorites
      `;
      const favoritesStats = await pool.query(favoritesQuery);

      // Most favorited products
      const mostFavoritedQuery = `
        SELECT 
          product_id,
          product_title,
          COUNT(*) as favorite_count
        FROM favorites 
        GROUP BY product_id, product_title
        ORDER BY favorite_count DESC
        LIMIT 10
      `;
      const mostFavorited = await pool.query(mostFavoritedQuery);

      // Translation statistics
      const translationStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) as cached,
          COALESCE(SUM(usage_count), 0) as api_calls
        FROM translations
      `;
      const translationStats = await pool.query(translationStatsQuery);

      // Most used translations with product URLs
      const mostTranslatedQuery = `
        SELECT 
          t.original_text,
          t.translated_text,
          t.usage_count,
          CASE 
            WHEN t.product_id IS NOT NULL THEN 
              CONCAT('https://gamoiwere.ge/product/', t.product_id)
            ELSE NULL
          END as product_url,
          t.product_id
        FROM translations t
        WHERE t.usage_count > 0 AND t.product_id IS NOT NULL
        ORDER BY t.usage_count DESC
        LIMIT 10
      `;
      const mostTranslated = await pool.query(mostTranslatedQuery);

      // Most used translations in last 7 days
      const weeklyTranslatedQuery = `
        SELECT 
          t.original_text,
          t.translated_text,
          COUNT(*) as weekly_usage_count,
          CASE 
            WHEN t.product_id IS NOT NULL THEN 
              CONCAT('https://gamoiwere.ge/product/', t.product_id)
            ELSE NULL
          END as product_url,
          t.product_id
        FROM translations t
        WHERE t.product_id IS NOT NULL 
          AND t.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY t.original_text, t.translated_text, t.product_id
        ORDER BY weekly_usage_count DESC
        LIMIT 10
      `;
      const weeklyTranslated = await pool.query(weeklyTranslatedQuery);

      // Most used translations today
      const todayTranslatedQuery = `
        SELECT 
          t.original_text,
          t.translated_text,
          COUNT(*) as daily_usage_count,
          CASE 
            WHEN t.product_id IS NOT NULL THEN 
              CONCAT('https://gamoiwere.ge/product/', t.product_id)
            ELSE NULL
          END as product_url,
          t.product_id
        FROM translations t
        WHERE t.product_id IS NOT NULL 
          AND DATE(t.created_at) = CURRENT_DATE
        GROUP BY t.original_text, t.translated_text, t.product_id
        ORDER BY daily_usage_count DESC
        LIMIT 10
      `;
      const todayTranslated = await pool.query(todayTranslatedQuery);

      // Email logs statistics
      const emailStatsQuery = `
        SELECT 
          COUNT(*) as total_emails,
          COUNT(CASE WHEN sent_at >= $1 THEN 1 END) as recent_emails
        FROM email_logs
      `;
      const emailStats = await pool.query(emailStatsQuery, [startOfWeek]);

      // Email templates count
      const emailTemplatesQuery = `SELECT COUNT(*) as total_templates FROM email_templates`;
      const emailTemplates = await pool.query(emailTemplatesQuery);

      // Address statistics
      const addressStatsQuery = `
        SELECT 
          COUNT(*) as total_addresses,
          COUNT(DISTINCT user_id) as active_addresses
        FROM addresses
      `;
      const addressStats = await pool.query(addressStatsQuery);

      // SMS statistics (actual SMS logs)
      const smsStatsQuery = `
        SELECT 
          COUNT(*) as total_sms_sent,
          COUNT(CASE WHEN sent_at >= $1 THEN 1 END) as recent_sms
        FROM sms_logs
        WHERE status = 'sent'
      `;
      const smsStats = await pool.query(smsStatsQuery, [startOfWeek]);

      // User growth statistics (using ID-based approximation)
      const userGrowthQuery = `
        SELECT 
          COUNT(CASE WHEN id >= (SELECT GREATEST(MAX(id) - 10, 1) FROM users) THEN 1 END) as this_month,
          COUNT(CASE WHEN id >= (SELECT GREATEST(MAX(id) - 3, 1) FROM users) THEN 1 END) as this_week
        FROM users
      `;
      const userGrowth = await pool.query(userGrowthQuery);

      const statistics = {
        users: {
          total: parseInt(userStats.rows[0].total),
          verified: parseInt(userStats.rows[0].verified),
          unverified: parseInt(userStats.rows[0].unverified),
          admins: parseInt(userStats.rows[0].admins),
          thisMonth: parseInt(userGrowth.rows[0].this_month),
          thisWeek: parseInt(userGrowth.rows[0].this_week)
        },
        orders: {
          total: parseInt(orderStats.rows[0].total),
          pending: parseInt(orderStats.rows[0].pending),
          paid: parseInt(orderStats.rows[0].paid),
          shipped: parseInt(orderStats.rows[0].shipped),
          delivered: parseInt(orderStats.rows[0].delivered),
          cancelled: parseInt(orderStats.rows[0].cancelled),
          refunded: parseInt(orderStats.rows[0].refunded),
          thisMonth: parseInt(orderStats.rows[0].this_month),
          thisWeek: parseInt(orderStats.rows[0].this_week),
          totalRevenue: parseInt(orderStats.rows[0].total_revenue),
          averageOrderValue: parseInt(orderStats.rows[0].average_order_value)
        },
        products: {
          total: parseInt(favoritesStats.rows[0].unique_products),
          favorites: parseInt(favoritesStats.rows[0].total_favorites),
          mostFavorited: mostFavorited.rows.map(row => ({
            productId: row.product_id,
            productTitle: row.product_title,
            favoriteCount: parseInt(row.favorite_count)
          }))
        },
        communications: {
          emailsSent: parseInt(emailStats.rows[0].total_emails),
          smssSent: parseInt(smsStats.rows[0].total_sms_sent),
          emailTemplates: parseInt(emailTemplates.rows[0].total_templates),
          recentEmails: parseInt(emailStats.rows[0].recent_emails),
          recentSms: parseInt(smsStats.rows[0].recent_sms)
        },
        translations: {
          total: parseInt(translationStats.rows[0].total),
          cached: parseInt(translationStats.rows[0].cached),
          apiCalls: parseInt(translationStats.rows[0].api_calls),
          mostTranslated: mostTranslated.rows.map(row => ({
            originalText: row.original_text,
            translatedText: row.translated_text,
            usageCount: parseInt(row.usage_count),
            productUrl: row.product_url,
            productId: row.product_id
          })),
          weeklyTranslated: weeklyTranslated.rows.map(row => ({
            originalText: row.original_text,
            translatedText: row.translated_text,
            usageCount: parseInt(row.weekly_usage_count),
            productUrl: row.product_url,
            productId: row.product_id
          })),
          todayTranslated: todayTranslated.rows.map(row => ({
            originalText: row.original_text,
            translatedText: row.translated_text,
            usageCount: parseInt(row.daily_usage_count),
            productUrl: row.product_url,
            productId: row.product_id
          }))
        },
        system: {
          totalAddresses: parseInt(addressStats.rows[0].total_addresses),
          activeAddresses: parseInt(addressStats.rows[0].active_addresses),
          deliveryMethods: 3, // Standard delivery methods count
          paymentMethods: 2   // Bank transfer and balance payment
        }
      };

      res.json(statistics);
    } catch (error) {
      console.error('Error fetching site statistics:', error);
      res.status(500).json({ message: 'სტატისტიკების მიღება ვერ მოხერხდა' });
    }
  });

  // Send test email endpoint
  app.post('/api/admin/send-test-email', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { to } = req.body;

      if (!to) {
        return res.status(400).json({ message: 'მიმღების ელ.ფოსტის მისამართი აუცილებელია' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return res.status(400).json({ message: 'არასწორი ელ.ფოსტის ფორმატი' });
      }

      // Get default email template from database
      const defaultTemplate = await storage.getDefaultEmailTemplate();
      if (!defaultTemplate) {
        return res.status(400).json({ message: 'ნაგულისხმევი მეილის შაბლონი ვერ მოიძებნა' });
      }

      const success = await gmailService.sendTestEmail({ 
        to, 
        subject: defaultTemplate.subject, 
        message: defaultTemplate.message 
      });
      
      if (success) {
        // Save email log to database
        try {
          await storage.createEmailLog({
            recipientEmail: to,
            subject: defaultTemplate.subject,
            message: defaultTemplate.message,
            messageId: typeof success === 'string' ? success : null,
            status: 'sent',
            sentBy: req.session.user?.id || null,
          });
        } catch (logError) {
          console.error('Error saving email log:', logError);
          // Continue even if logging fails
        }

        res.json({ 
          message: 'სატესტო მეილი წარმატებით გაიგზავნა',
          to,
          subject: defaultTemplate.subject,
          sentAt: new Date()
        });
      } else {
        res.status(500).json({ message: 'მეილის გაგზავნა ვერ მოხერხდა' });
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      res.status(500).json({ 
        message: error.message || 'მეილის გაგზავნის შეცდომა' 
      });
    }
  });

  // Get email logs endpoint
  app.get('/api/admin/email-logs', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const emailLogs = await storage.getAllEmailLogs();
      res.json(emailLogs);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      res.status(500).json({ message: 'ელ-ფოსტის ისტორიის მოძიება ვერ მოხერხდა' });
    }
  });

  // Email Templates Routes
  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({ error: 'შეცდომა მეილის შაბლონების წამოღებისას' });
    }
  });

  app.get('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'შაბლონი ვერ მოიძებნა' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching email template:', error);
      res.status(500).json({ error: 'შეცდომა შაბლონის წამოღებისას' });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name, subject, message, isDefault } = req.body;
      
      if (!name || !subject || !message) {
        return res.status(400).json({ error: 'ყველა ველის შევსება აუცილებელია' });
      }

      const template = await storage.createEmailTemplate({
        name,
        subject,
        message,
        isDefault: isDefault || false
      });

      // If this template is set as default, update any previous default
      if (isDefault) {
        await storage.setDefaultEmailTemplate(template.id);
      }

      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ error: 'შეცდომა შაბლონის შექმნისას' });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, subject, message, isDefault } = req.body;
      
      const template = await storage.updateEmailTemplate(id, {
        name,
        subject,
        message,
        isDefault
      });

      // If this template is set as default, update any previous default
      if (isDefault) {
        await storage.setDefaultEmailTemplate(id);
      }

      res.json(template);
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ error: 'შეცდომა შაბლონის განახლებისას' });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmailTemplate(id);
      
      if (!success) {
        return res.status(404).json({ error: 'შაბლონი ვერ მოიძებნა' });
      }
      
      res.json({ message: 'შაბლონი წარმატებით წაიშალა' });
    } catch (error) {
      console.error('Error deleting email template:', error);
      res.status(500).json({ error: 'შეცდომა შაბლონის წაშლისას' });
    }
  });

  app.post('/api/admin/email-templates/:id/set-default', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.setDefaultEmailTemplate(id);
      
      if (!success) {
        return res.status(404).json({ error: 'შაბლონი ვერ მოიძებნა' });
      }
      
      res.json({ message: 'შაბლონი დაყენდა როგორც ნაგულისხმევი' });
    } catch (error) {
      console.error('Error setting default template:', error);
      res.status(500).json({ error: 'შეცდომა ნაგულისხმევი შაბლონის დაყენებისას' });
    }
  });

  // Admin Orders Management
  // Admin: Get single order details
  app.get('/api/admin/orders/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      // Get order details using storage layer
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get user details
      const user = await storage.getUserById(order.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Format the response to match the frontend interface
      const orderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        username: user.username,
        userEmail: user.email,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        deliveryMethod: order.deliveryMethod,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        shippingCity: order.shippingCity,
        shippingPostalCode: order.shippingPostalCode,
        notes: order.notes,
        estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString()
      };

      res.json(orderResponse);
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const status = req.query.status as string || 'all';
      const sortBy = req.query.sortBy as string || 'newest';

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build where clause for search and status filter
      let whereClause = '';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereClause += `WHERE (o.order_number ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      if (status !== 'all') {
        if (whereClause) {
          paramCount++;
          whereClause += ` AND o.status = $${paramCount}`;
        } else {
          paramCount++;
          whereClause += `WHERE o.status = $${paramCount}`;
        }
        queryParams.push(status);
      }

      // Build order clause
      let orderClause = 'ORDER BY o.created_at DESC';
      switch (sortBy) {
        case 'oldest':
          orderClause = 'ORDER BY o.created_at ASC';
          break;
        case 'amount-high':
          orderClause = 'ORDER BY o.total_amount DESC';
          break;
        case 'amount-low':
          orderClause = 'ORDER BY o.total_amount ASC';
          break;
        default:
          orderClause = 'ORDER BY o.created_at DESC';
      }

      // Get orders with user information
      const ordersQuery = `
        SELECT 
          o.id,
          o.order_number,
          o.user_id,
          u.username,
          u.email as user_email,
          o.status,
          o.total_amount,
          o.created_at,
          o.updated_at,
          o.items,
          o.shipping_address,
          o.payment_method,
          o.delivery_method,
          o.recipient_name,
          o.recipient_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
        ${orderClause}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(limit, offset);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
      `;

      const countParams = queryParams.slice(0, paramCount);

      const [ordersResult, countResult] = await Promise.all([
        pool.query(ordersQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const orders = ordersResult.rows.map(row => ({
        id: row.id,
        orderNumber: row.order_number,
        userId: row.user_id,
        username: row.username || 'Unknown',
        userEmail: row.user_email || 'Unknown',
        status: row.status,
        totalAmount: row.total_amount,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: row.items || [],
        shippingAddress: row.shipping_address,
        paymentMethod: row.payment_method,
        deliveryMethod: row.delivery_method,
        recipientName: row.recipient_name,
        recipientPhone: row.recipient_phone
      }));

      const total = parseInt(countResult.rows[0].total);

      res.json({
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } catch (error) {
      console.error('Error fetching admin orders:', error);
      res.status(500).json({ message: 'შეკვეთების წამოღება ვერ მოხერხდა' });
    }
  });

  // Export orders endpoint
  app.post('/api/admin/orders/export', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { search = '', status = 'all', sortBy = 'newest' } = req.body;

      // Build where clause
      let whereClause = '';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereClause += `WHERE (o.order_number ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      if (status !== 'all') {
        if (whereClause) {
          paramCount++;
          whereClause += ` AND o.status = $${paramCount}`;
        } else {
          paramCount++;
          whereClause += `WHERE o.status = $${paramCount}`;
        }
        queryParams.push(status);
      }

      // Build order clause
      let orderClause = 'ORDER BY o.created_at DESC';
      switch (sortBy) {
        case 'oldest':
          orderClause = 'ORDER BY o.created_at ASC';
          break;
        case 'amount-high':
          orderClause = 'ORDER BY o.total_amount DESC';
          break;
        case 'amount-low':
          orderClause = 'ORDER BY o.total_amount ASC';
          break;
        default:
          orderClause = 'ORDER BY o.created_at DESC';
      }

      const ordersQuery = `
        SELECT 
          o.order_number,
          u.username,
          u.email,
          o.status,
          o.total_amount,
          o.created_at,
          o.shipping_address,
          o.payment_method,
          o.delivery_method,
          array_length(o.items, 1) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
        ${orderClause}
      `;

      const result = await pool.query(ordersQuery, queryParams);

      // Create CSV content
      const headers = ['Order Number', 'Username', 'Email', 'Status', 'Amount (₾)', 'Date', 'Address', 'Payment Method', 'Delivery Method', 'Items'];
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => [
          row.order_number,
          row.username || 'Unknown',
          row.email || 'Unknown',
          row.status,
          (row.total_amount / 100).toFixed(2),
          new Date(row.created_at).toLocaleString(),
          `"${row.shipping_address || ''}"`,
          row.payment_method || '',
          row.delivery_method || '',
          row.item_count || 0
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
      res.send(csvContent);

    } catch (error) {
      console.error('Error exporting orders:', error);
      res.status(500).json({ message: 'შეკვეთების ექსპორტი ვერ მოხერხდა' });
    }
  });

  // Update order status endpoint
  app.patch('/api/admin/orders/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: 'შეკვეთის ID აუცილებელია' });
      }

      if (!status) {
        return res.status(400).json({ message: 'სტატუსი აუცილებელია' });
      }

      // Validate status
      const validStatuses = ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'არასწორი სტატუსი' });
      }

      // Update order status
      const updateQuery = `
        UPDATE orders 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [status, orderId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა' });
      }

      res.json({
        message: 'შეკვეთის სტატუსი წარმატებით განახლდა',
        order: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'შეკვეთის სტატუსის განახლება ვერ მოხერხდა' });
    }
  });

  // Delete order endpoint
  app.delete('/api/admin/orders/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);

      if (!orderId) {
        return res.status(400).json({ message: 'შეკვეთის ID აუცილებელია' });
      }

      // Check if order exists
      const checkQuery = 'SELECT * FROM orders WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [orderId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა' });
      }

      // Delete related payments first
      await pool.query('DELETE FROM payments WHERE order_id = $1', [orderId]);

      // Delete the order
      const deleteQuery = 'DELETE FROM orders WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [orderId]);

      res.json({
        message: 'შეკვეთა წარმატებით წაიშალა',
        deletedOrder: result.rows[0]
      });

    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'შეკვეთის წაშლა ვერ მოხერხდა' });
    }
  });

  // Translation endpoint for product titles with caching
  app.post('/api/translate-title', async (req, res) => {
    try {
      const { originalTitle, productId } = req.body;

      if (!originalTitle) {
        return res.status(400).json({ message: 'Original title is required' });
      }

      console.log('Starting translation for:', originalTitle);

      // First, check if we have this translation cached in the database
      const cachedTranslation = await storage.getTranslation(originalTitle, 'tr', 'ka');
      
      if (cachedTranslation) {
        console.log('Using cached translation:', cachedTranslation.translatedText);
        
        // Increment usage count for statistics
        await storage.incrementTranslationUsage(cachedTranslation.id);
        
        return res.json({ 
          translatedTitle: cachedTranslation.translatedText,
          originalTitle,
          cached: true
        });
      }

      // If not cached, proceed with OpenAI translation
      if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY not found in environment variables');
        return res.status(500).json({ message: 'OpenAI API key not configured' });
      }

      // Import OpenAI dynamically
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      const prompt = `Translate Turkish to Georgian exactly as shown in examples. Follow the patterns precisely.

      CRITICAL BRAND NAME RULES:
      - NEVER translate brand names: Dior, Sauvage, Chanel, Gucci, Prada, Versace, Calvin Klein, Hugo Boss, etc.
      - Keep brand names in original language: "Sauvage" → "Sauvage" (NOT "სავლაჟი")
      - "Dior Sauvage" → "Dior Sauvage"
      - "C. Sauvage" → "C. Sauvage"

      GENDER RULE: Only use "ქალის"/"მამაკაცის" if Turkish has "Kadın"/"Erkek" or clearly gendered clothing.

      EXACT PATTERNS:
      - Brand names stay unchanged (Rio → Rio, Sauvage → Sauvage)
      - "Çamaşır Makinesi Üstü" = "სარეცხი მანქანის ზემოთ დასამაგრებელი"
      - "Dolap/Dolabı" = "კარადა"
      - "Banyo" = "აბაზანის" 
      - "Mutfak" = "სამზარეულოს"

      EXACT EXAMPLES:
      "Rio Çamaşır Makinesi Üstü Düzenleyici Dolap" → "RIO სარეცხი მანქანის ზემოთ დასამაგრებელი კარადა"
      "Sauvage After Shave Lotion 100 ml" → "Sauvage აფთერ შეივ ლოსიონი 100 მლ"
      "Dior Sauvage EDP 100ml" → "Dior Sauvage EDP 100მლ"

      IMPORTANT: Provide ONLY the Georgian translation without any explanations, notes, or comments about gender rules.

      Translate: "${originalTitle}"`;

      console.log('Making OpenAI API call...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in Turkish to Georgian e-commerce translations. Provide accurate, SEO-friendly translations that appeal to Georgian customers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      console.log('OpenAI response received:', originalTitle, '→', response.choices[0]?.message?.content);

      let translatedTitle = response.choices[0].message.content?.trim();

      if (!translatedTitle) {
        throw new Error('Translation failed - empty response');
      }

      // Clean up any explanatory text or meta-commentary from OpenAI
      // Remove any text that starts with explanatory phrases
      translatedTitle = translatedTitle
        .replace(/^This product title does not.*?Here.*?translation.*?:/gis, '')
        .replace(/^This product title does not.*?translation.*?:/gis, '')
        .replace(/^The provided.*?translation.*?:/gis, '')
        .replace(/^.*?gender.*?translation.*?:/gis, '')
        .replace(/^.*?does not specify.*?:/gis, '')
        .replace(/^.*?refers to a digital.*?:/gis, '')
        .replace(/^.*?Therefore.*?:/gis, '')
        .replace(/^.*?However.*?:/gis, '')
        .replace(/^Note:.*$/gim, '')
        .replace(/^.*?explanation.*$/gim, '')
        .replace(/^\s*"([^"]+)"\s*$/g, '$1')  // Remove surrounding quotes
        .trim();

      // If the response still contains explanatory text, extract only the Georgian part
      const georgianMatch = translatedTitle.match(/([ა-ჰ][ა-ჰ\s\-–—.,!?0-9A-Za-z]*)/);
      if (georgianMatch && georgianMatch[1]) {
        translatedTitle = georgianMatch[1].trim();
      }

      console.log('Translation successful:', translatedTitle);

      // Save the translation to database for future use
      try {
        await storage.saveTranslation({
          productId: productId || null,
          originalText: originalTitle,
          translatedText: translatedTitle,
          sourceLanguage: 'tr',
          targetLanguage: 'ka',
          usageCount: 1
        });
        console.log('Translation cached in database');
      } catch (cacheError) {
        console.error('Failed to cache translation:', cacheError);
        // Don't fail the request if caching fails
      }

      res.json({ 
        translatedTitle,
        originalTitle 
      });

    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        message: 'Translation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search suggestions management endpoint (admin only)
  app.get('/api/admin/search-suggestions', isAdmin, async (req, res) => {
    try {
      const suggestions = await db.select()
        .from(searchSuggestions)
        .orderBy(desc(searchSuggestions.usageCount), desc(searchSuggestions.confidence));
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      res.status(500).json({ message: 'Failed to fetch search suggestions' });
    }
  });

  // Update search suggestion (admin only)
  app.patch('/api/admin/search-suggestions/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, confidence, suggestedQuery } = req.body;
      
      await db.update(searchSuggestions)
        .set({ 
          isActive,
          confidence,
          suggestedQuery,
          updatedAt: new Date()
        })
        .where(eq(searchSuggestions.id, parseInt(id)));
      
      res.json({ message: 'Search suggestion updated successfully' });
    } catch (error) {
      console.error('Error updating search suggestion:', error);
      res.status(500).json({ message: 'Failed to update search suggestion' });
    }
  });

  // Add new search suggestion (admin only)
  app.post('/api/admin/search-suggestions', isAdmin, async (req, res) => {
    try {
      const { originalQuery, suggestedQuery, queryType, confidence, language } = req.body;
      
      const newSuggestion = await db.insert(searchSuggestions).values({
        originalQuery: originalQuery.toLowerCase().trim(),
        suggestedQuery,
        queryType,
        confidence: confidence || 90,
        language: language || 'en',
        usageCount: 0
      }).returning();
      
      res.json(newSuggestion[0]);
    } catch (error) {
      console.error('Error adding search suggestion:', error);
      res.status(500).json({ message: 'Failed to add search suggestion' });
    }
  });

  // Fix brand name translations (admin only)
  app.post('/api/admin/fix-brand-translations', isAdmin, async (req, res) => {
    try {
      const brandNames = ['Sauvage', 'Dior', 'Chanel', 'Gucci', 'Prada', 'Versace', 'Calvin Klein', 'Hugo Boss', 'Tom Ford', 'Yves Saint Laurent', 'Givenchy', 'Armani'];
      let fixedCount = 0;

      for (const brand of brandNames) {
        // Georgian phonetic variations that need fixing
        const georgianVariations = {
          'Sauvage': ['სავლაჟ', 'სოვაჟ', 'საუვაჟ'],
          'Dior': ['დიორ'],
          'Chanel': ['შანელ'],
          'Gucci': ['გუჩი'],
          'Prada': ['პრადა'],
          'Versace': ['ვერსაჩე'],
          'Calvin Klein': ['კალვინ კლაინი'],
          'Hugo Boss': ['ჰუგო ბოსი'],
          'Tom Ford': ['ტომ ფორდი'],
          'Yves Saint Laurent': ['ივ სენ ლორანი'],
          'Givenchy': ['ჟივანში'],
          'Armani': ['არმანი']
        };

        if (georgianVariations[brand]) {
          for (const variation of georgianVariations[brand]) {
            const result = await db
              .update(translations)
              .set({
                translatedText: sql`REPLACE(translated_text, ${variation}, ${brand})`
              })
              .where(sql`translated_text LIKE ${`%${variation}%`}`);
            
            fixedCount += result.rowCount || 0;
          }
        }
      }

      res.json({ 
        message: `Fixed ${fixedCount} brand name translations`,
        fixedCount 
      });
    } catch (error) {
      console.error('Error fixing brand translations:', error);
      res.status(500).json({ message: 'Failed to fix brand translations' });
    }
  });

  // Intelligent search endpoint with Turkish translation
  app.post('/api/smart-search', async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      console.log('Smart search for:', query);

      // Check database for intelligent search suggestions
      const queryLower = query.toLowerCase().trim();
      let correctedQuery = query;
      
      try {
        // Look for exact match or partial match in search suggestions
        const suggestions = await db.select()
          .from(searchSuggestions)
          .where(
            and(
              eq(searchSuggestions.isActive, true),
              or(
                eq(searchSuggestions.originalQuery, queryLower),
                sql`LOWER(${searchSuggestions.originalQuery}) = ${queryLower}`
              )
            )
          )
          .orderBy(desc(searchSuggestions.confidence))
          .limit(1);

        if (suggestions.length > 0) {
          const suggestion = suggestions[0];
          correctedQuery = suggestion.suggestedQuery;
          console.log(`Database suggestion applied: "${query}" → "${correctedQuery}" (${suggestion.queryType}, confidence: ${suggestion.confidence}%)`);
          
          // Update usage count
          await db.update(searchSuggestions)
            .set({ 
              usageCount: (suggestion.usageCount || 0) + 1,
              updatedAt: new Date()
            })
            .where(eq(searchSuggestions.id, suggestion.id));
        } else {
          // Fallback to hardcoded brand corrections for new variations
          const brandCorrections = {
            'savage': 'dior sauvage',
            'სავაჟი': 'dior sauvage',
            'savaj': 'dior sauvage',
            'savaje': 'dior sauvage',
            'sauvaj': 'dior sauvage',
            'dior savage': 'dior sauvage'
          };
          
          for (const [variant, correction] of Object.entries(brandCorrections)) {
            if (queryLower === variant || queryLower.includes(variant)) {
              correctedQuery = correction;
              console.log(`Fallback brand correction applied: "${query}" → "${correctedQuery}"`);
              
              // Add new suggestion to database for future use
              try {
                await db.insert(searchSuggestions).values({
                  originalQuery: queryLower,
                  suggestedQuery: correction,
                  queryType: 'brand_correction',
                  confidence: 90,
                  language: /[ა-ჰ]/.test(query) ? 'ka' : 'en',
                  usageCount: 1
                });
                console.log('New suggestion added to database');
              } catch (insertError) {
                console.error('Failed to add suggestion to database:', insertError);
              }
              break;
            }
          }
        }
      } catch (dbError) {
        console.error('Error querying search suggestions:', dbError);
        // Continue with original query if database query fails
      }

      // Check if query contains brand names that shouldn't be translated
      const brandNames = ['iPhone', 'apple', 'samsung', 'nike', 'adidas', 'sony', 'lg', 'huawei', 'xiaomi', 'google', 'microsoft', 'facebook', 'instagram', 'tiktok', 'youtube', 'netflix', 'spotify', 'uber', 'tesla', 'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota', 'honda', 'ford', 'chevrolet', 'pepsi', 'coca-cola', 'mcdonalds', 'kfc', 'burger king', 'starbucks', 'amazon', 'ebay', 'paypal', 'visa', 'mastercard', 'american express', 'dior', 'chanel', 'gucci', 'prada', 'versace', 'armani', 'sauvage'];
      
      const isBrandQuery = brandNames.some(brand => correctedQuery.toLowerCase().includes(brand.toLowerCase()));

      let turkishQuery = correctedQuery;

      // If it's not a brand query and doesn't already look Turkish, translate it
      if (!isBrandQuery) {
        const turkishPattern = /[çğıöşüÇĞIİÖŞÜ]|erkek|kadın|beyaz|siyah|mavi|kırmızı|yeşil|sarı|pembe|mor|gömlek|pantolon|ayakkabı|çanta|elbise|tişört|sweatshirt|mont|ceket|etek|şort|jean|spor|günlük|klasik|modern|kaliteli|ucuz|indirim|beden|renk|model|marka|ürün|satış|alışveriş/i;
        
        if (!turkishPattern.test(query)) {
          try {
            const prompt = `Translate this search query to Turkish for e-commerce search on Trendyol. 
            
Rules:
- Translate common items: shoes → ayakkabı, shirt → gömlek, pants → pantolon, dress → elbise
- Translate colors: red → kırmızı, blue → mavi, black → siyah, white → beyaz
- Translate materials: cotton → pamuk, leather → deri, wool → yün
- Keep brand names unchanged: iPhone, Nike, Adidas, etc.
- For clothing, add appropriate gender if unclear: "shoes" → "ayakkabı" (gender neutral is fine)
- Keep it natural and how Turkish users would search

Search query: "${query}"

Provide only the Turkish translation:`;

            const response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are a professional translator specializing in e-commerce search queries. Translate to natural Turkish that Turkish users would actually search for on shopping websites."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: 100,
              temperature: 0.3
            });

            const translatedQuery = response.choices[0].message.content?.trim();
            if (translatedQuery) {
              turkishQuery = translatedQuery;
              console.log(`Translated "${query}" to "${turkishQuery}"`);
            }
          } catch (translationError) {
            console.error('Search translation failed:', translationError);
            // Continue with original query if translation fails
          }
        }
      }

      // Make the search request to the external API with Turkish query
      const searchUrl = `https://service.devmonkeys.ge/api/batchSearchItemsFrameForSearch?itemTitle=${encodeURIComponent(turkishQuery)}`;
      
      console.log('Searching with Turkish query:', turkishQuery);
      console.log('Search URL:', searchUrl);

      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`Search API returned ${searchResponse.status}`);
      }

      const searchResults = await searchResponse.json();

      res.json({
        originalQuery: query, // Show user their original search term
        turkishQuery: turkishQuery, // For debugging (don't show to user)
        results: searchResults,
        message: `ძიების შედეგები: "${query}"`
      });

    } catch (error) {
      console.error('Smart search error:', error);
      res.status(500).json({ 
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // SMS endpoints
  app.get('/api/admin/sms-logs', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const smsLogs = await storage.getAllSmsLogs();
      res.json(smsLogs);
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      res.status(500).json({ message: 'SMS ლოგების მიღება ვერ მოხერხდა' });
    }
  });

  app.get('/api/admin/sms-balance', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { smsService } = await import('./sms');
      const balanceResult = await smsService.checkBalance();
      
      if (balanceResult.success) {
        res.json({ balance: balanceResult.balance });
      } else {
        res.status(500).json({ message: balanceResult.error });
      }
    } catch (error) {
      console.error('Error checking SMS balance:', error);
      res.status(500).json({ message: 'ბალანსის შემოწმება ვერ მოხერხდა' });
    }
  });

  app.post('/api/admin/send-test-sms', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      console.log('SMS Request received:', { phone, message });
      
      if (!phone || !message) {
        return res.status(400).json({ 
          message: 'ტელეფონის ნომერი და შეტყობინება სავალდებულოა' 
        });
      }

      const { smsService } = await import('./sms');
      console.log('About to send SMS with phone:', phone);
      const result = await smsService.sendSms({ to: phone, message });
      console.log('SMS result:', result);
      
      // Log the SMS attempt
      const userId = req.session.user?.id;
      await storage.createSmsLog({
        recipientPhone: phone,
        message,
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        errorMessage: result.error,
        sentBy: userId
      });

      if (result.success) {
        res.json({
          message: 'SMS წარმატებით გაიგზავნა',
          messageId: result.messageId,
          to: phone,
          sentAt: new Date()
        });
      } else {
        res.status(500).json({ message: result.error });
      }
    } catch (error: any) {
      console.error('Error sending test SMS:', error);
      res.status(500).json({ 
        message: error.message || 'SMS-ის გაგზავნის შეცდომა' 
      });
    }
  });

  // Send OTP for phone verification
  app.post('/api/user/send-verification-otp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'არაავტორიზებული მომხმარებელი' });
      }

      // Get user data
      const userResult = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      if (!user || !user.phone) {
        return res.status(400).json({ message: 'მობილური ნომერი არ არის მითითებული' });
      }

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Store OTP temporarily (valid for 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        'INSERT INTO verification_codes (user_id, code, expires_at, type) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, type) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()',
        [userId, otp, expiresAt, 'phone_verification']
      );

      // Send SMS
      const smsMessage = `თქვენი ვერიფიკაციის კოდია: ${otp}. კოდი მოქმედებს 10 წუთის განმავლობაში.`;
      
      try {
        const smsResult = await smsService.sendSms({
          to: user.phone,
          message: smsMessage
        });

        if (smsResult.success) {
          // Log successful SMS
          await pool.query(
            'INSERT INTO sms_logs (recipient_phone, message, status, message_id, sent_at) VALUES ($1, $2, $3, $4, NOW())',
            [user.phone, smsMessage, 'sent', smsResult.messageId]
          );
          
          res.json({ success: true, message: 'ვერიფიკაციის კოდი გაგზავნილია' });
        } else {
          await pool.query(
            'INSERT INTO sms_logs (recipient_phone, message, status, error_message, sent_at) VALUES ($1, $2, $3, $4, NOW())',
            [user.phone, smsMessage, 'failed', smsResult.error]
          );
          
          res.status(500).json({ message: 'SMS გაგზავნა ვერ მოხერხდა' });
        }
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        res.status(500).json({ message: 'SMS სერვისის შეცდომა' });
      }
      
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ message: 'სერვერის შეცდომა' });
    }
  });

  // Verify phone with OTP
  app.post('/api/user/verify-phone', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      const { otp } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'არაავტორიზებული მომხმარებელი' });
      }

      if (!otp || otp.length !== 4) {
        return res.status(400).json({ message: 'არასწორი კოდის ფორმატი' });
      }

      // Check verification code
      const codeResult = await pool.query(
        'SELECT * FROM verification_codes WHERE user_id = $1 AND type = $2 AND code = $3 AND expires_at > NOW()',
        [userId, 'phone_verification', otp]
      );

      if (codeResult.rows.length === 0) {
        return res.status(400).json({ message: 'არასწორი ან ვადაგასული კოდი' });
      }

      // Update user verification status
      await pool.query(
        'UPDATE users SET verification_status = $1 WHERE id = $2',
        ['verified', userId]
      );

      // Delete used verification code
      await pool.query(
        'DELETE FROM verification_codes WHERE user_id = $1 AND type = $2',
        [userId, 'phone_verification']
      );

      res.json({ success: true, message: 'ვერიფიკაცია წარმატებით დასრულდა' });
      
    } catch (error) {
      console.error('Verify phone error:', error);
      res.status(500).json({ message: 'სერვერის შეცდომა' });
    }
  });

  // Get delivery tracking for an order
  app.get('/api/admin/orders/:orderId/delivery-tracking', isAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      const result = await pool.query(
        'SELECT * FROM delivery_tracking WHERE order_id = $1',
        [orderId]
      );

      res.json(result.rows[0] || null);
    } catch (error) {
      console.error('Get delivery tracking error:', error);
      res.status(500).json({ message: 'მიწოდების ინფორმაციის მიღება ვერ მოხერხდა' });
    }
  });

  // Create or update delivery tracking
  app.post('/api/admin/orders/:orderId/delivery-tracking', isAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const {
        productWeight,
        transportationPrice,
        trackingNumber,
        deliveryStatus,
        orderedAt,
        receivedChinaAt,
        sentTbilisiAt,
        deliveredTbilisiAt,
        notes
      } = req.body;

      // Check if tracking already exists
      const existingResult = await pool.query(
        'SELECT id FROM delivery_tracking WHERE order_id = $1',
        [orderId]
      );

      // Get order details to find the user
      const orderResult = await pool.query(
        'SELECT user_id FROM orders WHERE id = $1',
        [orderId]
      );
      
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: 'შეკვეთა ვერ მოიძებნა' });
      }
      
      const userId = orderResult.rows[0].user_id;

      if (existingResult.rows.length > 0) {
        // Get current transportation price to calculate difference
        const currentResult = await pool.query(
          'SELECT transportation_price FROM delivery_tracking WHERE order_id = $1',
          [orderId]
        );
        const currentPrice = currentResult.rows[0].transportation_price || 0;
        const priceDifference = transportationPrice - currentPrice;
        
        // Update existing tracking
        await pool.query(
          `UPDATE delivery_tracking SET 
           product_weight = $2, 
           transportation_price = $3, 
           tracking_number = $4, 
           delivery_status = $5, 
           ordered_at = $6, 
           received_china_at = $7, 
           sent_tbilisi_at = $8, 
           delivered_tbilisi_at = $9, 
           notes = $10, 
           updated_at = NOW()
           WHERE order_id = $1`,
          [orderId, productWeight, transportationPrice, trackingNumber, deliveryStatus, 
           orderedAt, receivedChinaAt, sentTbilisiAt, deliveredTbilisiAt, notes]
        );
        
        // Update user's pending transportation fees only if price changed
        if (priceDifference !== 0) {
          await pool.query(
            'UPDATE users SET pending_transportation_fees = pending_transportation_fees + $1 WHERE id = $2',
            [priceDifference, userId]
          );
        }
      } else {
        // Create new tracking
        await pool.query(
          `INSERT INTO delivery_tracking 
           (order_id, product_weight, transportation_price, tracking_number, delivery_status, 
            ordered_at, received_china_at, sent_tbilisi_at, delivered_tbilisi_at, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [orderId, productWeight, transportationPrice, trackingNumber, deliveryStatus, 
           orderedAt, receivedChinaAt, sentTbilisiAt, deliveredTbilisiAt, notes]
        );
        
        // Add transportation price as pending fee for new tracking
        if (transportationPrice && transportationPrice > 0) {
          await pool.query(
            'UPDATE users SET pending_transportation_fees = pending_transportation_fees + $1 WHERE id = $2',
            [transportationPrice, userId]
          );
        }
      }

      // Send SMS notification to user about status update
      const userResult = await pool.query(
        'SELECT u.username, u.phone, o.order_number FROM users u JOIN orders o ON u.id = o.user_id WHERE o.id = $1',
        [orderId]
      );
      
      if (userResult.rows.length > 0) {
        const { username, phone, order_number } = userResult.rows[0];
        
        if (phone && deliveryStatus) {
          const statusMessages = {
            'ORDERED': `თქვენი შეკვეთა ${order_number} დამუშავდა!`,
            'RECEIVED_CHINA': `თქვენი შეკვეთა ${order_number} მივიდა საწყობში! მიწოდების ღირებულება: ${(transportationPrice / 100).toFixed(2)} ₾. ტრეკინგი: ${trackingNumber}. გთხოვთ დაფაროთ ღირებულება დროულად რომ არ შეფერხდეს ამანათის გამოგზავნა`,
            'SENT_TBILISI': `შეკვეთა ${order_number} - სტატუსი: გაგზავნილია თბილისში`,
            'DELIVERED_TBILISI': `შეკვეთა ${order_number} - სტატუსი: ჩაბარებულია თბილისში`
          };
          
          const message = statusMessages[deliveryStatus as keyof typeof statusMessages] || `შეკვეთა ${order_number} - სტატუსი განახლდა. მიწოდების ღირებულება: ${(transportationPrice / 100).toFixed(2)} ₾`;
          
          // Create and send real-time notification
          const notificationTitles = {
            'ORDERED': 'შეკვეთა დამუშავდა',
            'RECEIVED_CHINA': 'შეკვეთა მივიდა საწყობში',
            'SENT_TBILISI': 'შეკვეთა გაგზავნილია',
            'DELIVERED_TBILISI': 'შეკვეთა ჩაბარებულია'
          };
          
          const notificationTitle = notificationTitles[deliveryStatus as keyof typeof notificationTitles] || 'მიწოდების სტატუსი განახლდა';
          
          // Send real-time notification
          await createAndSendNotification(
            userId,
            orderId,
            notificationTitle,
            message,
            'delivery_update'
          );
          
          try {
            const smsResult = await smsService.sendSms({
              to: phone,
              message: message
            });
            
            // Log SMS attempt
            await pool.query(
              'INSERT INTO sms_logs (user_id, recipient_phone, message, status, order_id) VALUES ($1, $2, $3, $4, $5)',
              [userId, phone, message, smsResult.success ? 'sent' : 'failed', orderId]
            );
            
            console.log(`SMS ${smsResult.success ? 'sent' : 'failed'} to ${username} (${phone}): ${message}`);
          } catch (smsError) {
            console.error('SMS sending error:', smsError);
            // Log failed SMS attempt
            await pool.query(
              'INSERT INTO sms_logs (user_id, phone_number, message, status, delivery_status, order_id) VALUES ($1, $2, $3, $4, $5, $6)',
              [userId, phone, message, 'failed', deliveryStatus, orderId]
            );
          }
        }
      }

      res.json({ success: true, message: 'მიწოდების ინფორმაცია შენახულია და SMS გაგზავნილია' });
    } catch (error) {
      console.error('Save delivery tracking error:', error);
      res.status(500).json({ message: 'მიწოდების ინფორმაციის შენახვა ვერ მოხერხდა' });
    }
  });

  // Notification API endpoints
  app.get('/api/notifications', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      res.json(result);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'შეტყობინებების მიღება ვერ მოხერხდა' });
    }
  });

  // Category population progress endpoint
  app.get('/api/admin/category-progress', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get total count
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM api_categories');
      const total = parseInt(totalResult.rows[0].total);

      // Get counts by level
      const levelResult = await pool.query(`
        SELECT level, COUNT(*) as count 
        FROM api_categories 
        GROUP BY level 
        ORDER BY level
      `);
      
      // Get translation statistics
      const translationResult = await pool.query(`
        SELECT 
          COUNT(*) as total_categories,
          COUNT(CASE WHEN turkish_name IS NOT NULL AND turkish_name != '' THEN 1 END) as with_turkish,
          COUNT(CASE WHEN translated_categories IS NOT NULL AND translated_categories != '' THEN 1 END) as with_georgian,
          ROUND(COUNT(CASE WHEN translated_categories IS NOT NULL AND translated_categories != '' THEN 1 END) * 100.0 / COUNT(*), 2) as georgian_percentage
        FROM api_categories
      `);
      
      // Get key categories with their API IDs and translations
      const keyResult = await pool.query(`
        SELECT api_id, name, level, turkish_name, translated_categories
        FROM api_categories 
        WHERE name IN ('ელექტრონიკა', 'Ქალისთვის', 'მამაკაცებისთვის', 'ბავშვებისთვის', 'სახლისთვის')
        OR translated_categories IN ('ელექტრონიკა', 'ქალებისთვის', 'მამაკაცებისთვის', 'ბავშვებისთვის', 'მანქანები და მოტოციკლები')
        ORDER BY name
        LIMIT 10
      `);

      // Get recent translations for monitoring
      const recentTranslations = await pool.query(`
        SELECT api_id, turkish_name, translated_categories, level
        FROM api_categories 
        WHERE translated_categories IS NOT NULL 
        ORDER BY id DESC 
        LIMIT 15
      `);

      const translationStats = translationResult.rows[0];

      const response = {
        total,
        byLevel: levelResult.rows.map(row => ({
          level: parseInt(row.level),
          count: parseInt(row.count)
        })),
        keyCategories: keyResult.rows.map(row => ({
          api_id: row.api_id,
          name: row.name,
          level: parseInt(row.level),
          turkish_name: row.turkish_name,
          translated_categories: row.translated_categories
        })),
        translation: {
          total: parseInt(translationStats.total_categories),
          withTurkish: parseInt(translationStats.with_turkish),
          withGeorgian: parseInt(translationStats.with_georgian),
          georgianPercentage: parseFloat(translationStats.georgian_percentage),
          recentTranslations: recentTranslations.rows.map(row => ({
            api_id: row.api_id,
            turkish_name: row.turkish_name,
            translated_categories: row.translated_categories,
            level: parseInt(row.level)
          }))
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Category progress error:', error);
      res.status(500).json({ message: 'კატეგორიების სტატისტიკის მიღება ვერ მოხერხდა' });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      const notificationId = parseInt(req.params.id);
      
      await db
        .update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: 'შეტყობინების მარკირება ვერ მოხერხდა' });
    }
  });

  app.patch('/api/notifications/mark-all-read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      await db
        .update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: 'შეტყობინებების მარკირება ვერ მოხერხდა' });
    }
  });

  app.delete('/api/notifications/clear-read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      await db
        .delete(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, true)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Clear read notifications error:', error);
      res.status(500).json({ message: 'წაკითხული შეტყობინებების გასუფთავება ვერ მოხერხდა' });
    }
  });

  // AI-powered intelligent search suggestion system
  async function detectMisspellingWithAI(query: string, language: string = 'ka'): Promise<{
    hasSuggestion: boolean;
    suggestedQuery?: string;
    queryType?: string;
    confidence?: number;
  }> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert in Georgian language and brand name recognition. Analyze search queries for:
1. Georgian misspellings of international brand names (like "სუმსანგი" → "Samsung", "ადიბასი" → "Adidas")
2. Common Georgian spelling mistakes for technology/fashion brands
3. Phonetic variations of brand names written in Georgian script

Respond with JSON in this exact format:
{
  "hasSuggestion": boolean,
  "suggestedQuery": "corrected_brand_name",
  "queryType": "brand_correction" | "spelling_fix" | "phonetic_variation",
  "confidence": number (0-100)
}

Only suggest corrections for well-known international brands. If no correction needed, return hasSuggestion: false.`
          },
          {
            role: "user",
            content: `Analyze this Georgian search query: "${query}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content || '{"hasSuggestion": false}');
      
      // Auto-save new corrections to database for future use
      if (result.hasSuggestion && result.suggestedQuery && result.confidence > 70) {
        try {
          await db
            .insert(searchSuggestions)
            .values({
              originalQuery: query.toLowerCase(),
              suggestedQuery: result.suggestedQuery,
              queryType: result.queryType || 'ai_correction',
              confidence: result.confidence,
              language: language,
              isActive: true,
              usageCount: 1
            })
            .onConflictDoNothing();
        } catch (dbError) {
          console.log('AI correction saved to database:', query, '→', result.suggestedQuery);
        }
      }

      return result;
    } catch (error) {
      console.error('AI misspelling detection error:', error);
      return { hasSuggestion: false };
    }
  }

  // Search suggestions API routes with AI fallback
  app.get('/api/search-suggestions/:query', async (req: Request, res: Response) => {
    try {
      const { query } = req.params;
      const { language = 'ka' } = req.query;

      // Search for exact matches first
      const exactMatch = await db
        .select()
        .from(searchSuggestions)
        .where(
          and(
            eq(searchSuggestions.originalQuery, query.toLowerCase()),
            eq(searchSuggestions.language, language as string),
            eq(searchSuggestions.isActive, true)
          )
        )
        .orderBy(desc(searchSuggestions.confidence))
        .limit(1);

      if (exactMatch.length > 0) {
        // Update usage count
        await db
          .update(searchSuggestions)
          .set({ 
            usageCount: exactMatch[0].usageCount + 1,
            updatedAt: new Date()
          })
          .where(eq(searchSuggestions.id, exactMatch[0].id));

        return res.json({
          hasSuggestion: true,
          originalQuery: query,
          suggestedQuery: exactMatch[0].suggestedQuery,
          queryType: exactMatch[0].queryType,
          confidence: exactMatch[0].confidence
        });
      }

      // Search for partial matches
      const partialMatches = await db
        .select()
        .from(searchSuggestions)
        .where(
          and(
            sql`${searchSuggestions.originalQuery} ILIKE ${`%${query.toLowerCase()}%`}`,
            eq(searchSuggestions.language, language as string),
            eq(searchSuggestions.isActive, true)
          )
        )
        .orderBy(desc(searchSuggestions.confidence))
        .limit(5);

      if (partialMatches.length > 0) {
        return res.json({
          hasSuggestion: true,
          originalQuery: query,
          suggestedQuery: partialMatches[0].suggestedQuery,
          queryType: partialMatches[0].queryType,
          confidence: partialMatches[0].confidence,
          alternatives: partialMatches.slice(1).map(match => ({
            query: match.suggestedQuery,
            confidence: match.confidence
          }))
        });
      }

      // If no database matches, use AI to detect potential misspellings
      if (language === 'ka' && query.length > 2) {
        const aiSuggestion = await detectMisspellingWithAI(query, language);
        
        if (aiSuggestion.hasSuggestion) {
          return res.json({
            hasSuggestion: true,
            originalQuery: query,
            suggestedQuery: aiSuggestion.suggestedQuery,
            queryType: aiSuggestion.queryType,
            confidence: aiSuggestion.confidence,
            isAiGenerated: true
          });
        }
      }

      res.json({
        hasSuggestion: false,
        originalQuery: query
      });

    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ message: 'ძიების შეთავაზების შეცდომა' });
    }
  });

  // Add new search suggestion
  app.post('/api/search-suggestions', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { originalQuery, suggestedQuery, queryType, confidence = 100, language = 'ka' } = req.body;

      const [suggestion] = await db
        .insert(searchSuggestions)
        .values({
          originalQuery: originalQuery.toLowerCase(),
          suggestedQuery,
          queryType,
          confidence,
          language,
          isActive: true,
          usageCount: 0
        })
        .returning();

      res.json(suggestion);
    } catch (error) {
      console.error('Add search suggestion error:', error);
      res.status(500).json({ message: 'ძიების შეთავაზების დამატება ვერ მოხერხდა' });
    }
  });

  // Enhanced smart search with intelligent correction
  app.post('/api/smart-search-with-correction', async (req: Request, res: Response) => {
    try {
      const { query, language = 'ka' } = req.body;

      // First check for search suggestions
      const suggestion = await db
        .select()
        .from(searchSuggestions)
        .where(
          and(
            eq(searchSuggestions.originalQuery, query.toLowerCase()),
            eq(searchSuggestions.language, language),
            eq(searchSuggestions.isActive, true)
          )
        )
        .orderBy(desc(searchSuggestions.confidence))
        .limit(1);

      let searchQuery = query;
      let correctedQuery = null;

      if (suggestion.length > 0) {
        searchQuery = suggestion[0].suggestedQuery;
        correctedQuery = {
          original: query,
          corrected: suggestion[0].suggestedQuery,
          type: suggestion[0].queryType,
          confidence: suggestion[0].confidence
        };

        // Update usage count
        await db
          .update(searchSuggestions)
          .set({ 
            usageCount: suggestion[0].usageCount + 1,
            updatedAt: new Date()
          })
          .where(eq(searchSuggestions.id, suggestion[0].id));
      }

      // Use the corrected query for the actual search
      const searchUrl = `https://service.devmonkeys.ge/api/batchSearchItemsFrameForSearch?itemTitle=${encodeURIComponent(searchQuery)}&framePosition=0&frameSize=20`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      res.json({
        ...searchData,
        correctedQuery,
        searchedWith: searchQuery
      });

    } catch (error) {
      console.error('Smart search with correction error:', error);
      res.status(500).json({ message: 'ინტელექტუალური ძიების შეცდომა' });
    }
  });

  // Health check endpoint to prevent app from sleeping
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      message: 'Server is running'
    });
  });

  // API Health check endpoint for Render.com
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'GAMOIWERE.GE',
      version: '1.0.0'
    });
  });

  // Keep-alive ping endpoint
  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ pong: true, timestamp: Date.now() });
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          userConnections.set(data.userId, ws);
          console.log(`User ${data.userId} connected to WebSocket`);
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'შეტყობინებები მზადაა'
          }));
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });

    ws.on('close', () => {
      // Remove user connection when they disconnect
      for (const [userId, connection] of userConnections.entries()) {
        if (connection === ws) {
          userConnections.delete(userId);
          console.log(`User ${userId} disconnected from WebSocket`);
          break;
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // AI Price Comparison Analysis
  // Translation status tracking
  let translationInProgress = false;
  let translationStats = { processed: 0, errors: 0, startTime: null };

  // Translation endpoint for admin - starts continuous process
  app.post('/api/admin/translate-categories', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      if (translationInProgress) {
        return res.json({ 
          success: false, 
          message: 'Translation is already in progress',
          inProgress: true,
          stats: translationStats
        });
      }

      // Check if there are categories to translate
      const checkResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM api_categories 
        WHERE turkish_name IS NOT NULL 
        AND (translated_categories IS NULL OR translated_categories = '')
      `);
      
      const remaining = parseInt(checkResult.rows[0].count);
      
      if (remaining === 0) {
        return res.json({ 
          success: true, 
          message: 'All categories have been translated!',
          inProgress: false,
          remaining: 0
        });
      }

      // Start the translation process in background
      translationInProgress = true;
      translationStats = { processed: 0, errors: 0, startTime: new Date() };
      
      console.log(`🚀 Starting continuous translation process for ${remaining} categories...`);
      
      // Immediately respond to user
      res.json({
        success: true,
        message: `Translation process started. Processing ${remaining} categories continuously until complete.`,
        inProgress: true,
        remaining: remaining,
        stats: translationStats
      });

      // Start background translation process
      processAllTranslationsContinuously();

    } catch (error) {
      console.error('Translation endpoint error:', error);
      translationInProgress = false;
      res.status(500).json({ 
        success: false, 
        error: 'Failed to start translation process',
        details: error.message 
      });
    }
  });

  // Background function to process all translations continuously
  async function processAllTranslationsContinuously() {
    try {
      console.log('🔄 Starting continuous translation process...');
      
      const batchSize = 5; // Process 5 at a time to manage API rate limits
      
      while (translationInProgress) {
        // Get next batch of categories to translate
        const result = await pool.query(`
          SELECT api_id, name, turkish_name, level 
          FROM api_categories 
          WHERE turkish_name IS NOT NULL 
          AND (translated_categories IS NULL OR translated_categories = '')
          ORDER BY level ASC, api_id ASC
          LIMIT $1
        `, [batchSize]);

        if (result.rows.length === 0) {
          console.log('🎉 All categories have been translated!');
          translationInProgress = false;
          break;
        }

        console.log(`📝 Processing batch of ${result.rows.length} categories (Total processed: ${translationStats.processed})...`);

        // Process current batch
        for (const category of result.rows) {
          if (!translationInProgress) break; // Allow stopping the process
          
          try {
            console.log(`Translating ${category.api_id}: ${category.turkish_name}`);
            
            // Call OpenAI to translate Turkish to Georgian
            const response = await openai.chat.completions.create({
              model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
              messages: [
                {
                  role: "system",
                  content: `You are a professional translator specializing in e-commerce category names. Translate Turkish category names to Georgian for an online marketplace. 

CRITICAL RULES:
1. Remove ALL duplicate words in translations (e.g., "შარფები და შარფები" → "შარფები")
2. Use professional Georgian e-commerce terminology
3. Keep translations concise and market-appropriate
4. Return ONLY the Georgian translation, no explanations
5. For clothing/fashion items, use standard Georgian retail terms
6. Examples: "Elektronik" → "ელექტრონიკა", "Otomobil" → "ავტომობილები"`
                },
                {
                  role: "user", 
                  content: `Translate this Turkish e-commerce category to Georgian: "${category.turkish_name}"`
                }
              ],
              max_tokens: 100,
              temperature: 0.3
            });

            const georgianTranslation = response.choices[0].message.content.trim();
            
            // Update the database with the translation
            await pool.query(`
              UPDATE api_categories 
              SET translated_categories = $1 
              WHERE api_id = $2
            `, [georgianTranslation, category.api_id]);
            
            translationStats.processed++;
            console.log(`✅ [${translationStats.processed}] ${category.api_id}: ${category.turkish_name} → ${georgianTranslation}`);
            
            // Small delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error) {
            translationStats.errors++;
            console.error(`❌ Translation error for ${category.api_id}:`, error.message);
            
            // Small delay before retrying next category
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Delay between batches to manage rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const duration = translationStats.startTime ? 
        Math.round((new Date().getTime() - translationStats.startTime.getTime()) / 1000) : 0;
      
      console.log(`🏁 Translation process completed! Processed: ${translationStats.processed}, Errors: ${translationStats.errors}, Duration: ${duration}s`);
      translationInProgress = false;

    } catch (error) {
      console.error('Background translation process error:', error);
      translationInProgress = false;
    }
  }

  // Status endpoint to check translation progress
  app.get('/api/admin/translation-status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const remainingResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM api_categories 
        WHERE turkish_name IS NOT NULL 
        AND (translated_categories IS NULL OR translated_categories = '')
      `);
      
      const remaining = parseInt(remainingResult.rows[0].count);
      
      const duration = translationStats.startTime ? 
        Math.round((new Date().getTime() - translationStats.startTime.getTime()) / 1000) : 0;

      res.json({
        inProgress: translationInProgress,
        remaining: remaining,
        isComplete: remaining === 0,
        stats: {
          ...translationStats,
          duration: duration
        }
      });

    } catch (error) {
      console.error('Translation status error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get translation status' 
      });
    }
  });

  // Stop translation endpoint
  app.post('/api/admin/stop-translation', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      if (!translationInProgress) {
        return res.json({ 
          success: false, 
          message: 'No translation process is currently running' 
        });
      }
      
      translationInProgress = false;
      console.log('🛑 Translation process stopped by admin');
      
      res.json({ 
        success: true, 
        message: 'Translation process stopped',
        stats: translationStats
      });
      
    } catch (error) {
      console.error('Stop translation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to stop translation process' 
      });
    }
  });

  app.post('/api/analyze-product-price', async (req: Request, res: Response) => {
    try {
      const { productName, currentPrice, category, description, productId } = req.body;
      
      if (!productName || !currentPrice) {
        return res.status(400).json({ error: 'Product name and current price are required' });
      }

      // Create a unique key for caching (use productId if available, otherwise create from name and price)
      const cacheKey = productId || `${productName.slice(0, 30)}-${currentPrice}`;
      
      console.log(`AI Price analysis request for: ${productName} (₾${currentPrice})`);
      
      // Check if we have cached analysis for this product
      try {
        const cached = await db.select()
          .from(priceAnalyses)
          .where(eq(priceAnalyses.productId, cacheKey))
          .limit(1);

        if (cached.length > 0) {
          const cachedAnalysis = cached[0];
          
          // Update usage count
          await db.update(priceAnalyses)
            .set({ 
              usageCount: cachedAnalysis.usageCount + 1,
              updatedAt: new Date()
            })
            .where(eq(priceAnalyses.productId, cacheKey));

          console.log(`Using cached AI analysis for: ${productName} (used ${cachedAnalysis.usageCount + 1} times)`);
          
          // Return cached result with proper format
          const result = {
            priceRating: cachedAnalysis.priceRating,
            marketPosition: cachedAnalysis.marketPosition,
            savings: cachedAnalysis.savings,
            confidence: parseFloat(cachedAnalysis.confidence.toString()),
            insights: typeof cachedAnalysis.insights === 'string' 
              ? JSON.parse(cachedAnalysis.insights) 
              : cachedAnalysis.insights,
            recommendation: cachedAnalysis.recommendation,
            cached: true
          };
          
          return res.json(result);
        }
      } catch (error) {
        console.log('Cache check failed, proceeding with AI analysis:', error);
      }
      
      // No cached result found, make OpenAI API call
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a price analysis expert. Analyze the given product and provide insights about its price competitiveness. Consider market standards, product category, and value proposition. Respond with JSON in this format: {
              "priceRating": number (1-5, where 5 is excellent value),
              "marketPosition": "excellent" | "good" | "average" | "expensive" | "overpriced",
              "savings": number (estimated savings percentage compared to market average),
              "confidence": number (0-1, confidence in analysis),
              "insights": ["insight1", "insight2", "insight3"],
              "recommendation": "Strong recommendation text in Georgian"
            }`
          },
          {
            role: "user",
            content: `Analyze this product:
            Name: ${productName}
            Current Price: ₾${currentPrice}
            Category: ${category || 'General'}
            Description: ${description || 'No description available'}
            
            Please provide price analysis in Georgian language for insights and recommendation.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure we have valid data
      const result = {
        priceRating: Math.max(1, Math.min(5, analysis.priceRating || 4)),
        marketPosition: analysis.marketPosition || 'good',
        savings: Math.max(0, Math.min(70, analysis.savings || 15)),
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.8)),
        insights: Array.isArray(analysis.insights) ? analysis.insights.slice(0, 3) : [
          'ღირებული ფასი ბაზარზე',
          'მაღალი ხარისხის პროდუქტი',
          'კარგი ღირებულება-ფასის თანაფარდობა'
        ],
        recommendation: analysis.recommendation || 'ეს პროდუქტი შესანიშნავი არჩევანია ღირებულების მიხედვით.'
      };

      // Cache the analysis result in database
      try {
        await db.insert(priceAnalyses).values({
          productId: cacheKey,
          productTitle: productName,
          productPrice: currentPrice.toString(),
          priceRating: result.priceRating,
          marketPosition: result.marketPosition,
          savings: result.savings || null,
          confidence: result.confidence.toString(),
          insights: JSON.stringify(result.insights),
          recommendation: result.recommendation,
          usageCount: 1
        });
        console.log(`Cached AI analysis for future use: ${productName}`);
      } catch (cacheError) {
        console.error('Failed to cache analysis result:', cacheError);
        // Continue without caching - don't fail the request
      }

      console.log('AI Price analysis result:', result);
      res.json(result);
    } catch (error) {
      console.error('AI Price analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze product price' });
    }
  });

  // BOG Payment Routes

  // Route to initiate BOG payment and get redirect URL
  app.post('/api/bog-payment/create-order', isAuthenticated, async (req: any, res) => {
    try {
      console.log('BOG payment create-order - Session ID:', req.sessionID);
      console.log('BOG payment create-order - Session data:', req.session);
      console.log('BOG payment create-order - Session user:', req.session.user);
      
      const { cartItems, totalAmount, deliveryAddress, userInfo } = req.body;
      
      if (!req.session.user) {
        console.error('No session user found in create-order route');
        return res.status(401).json({ error: 'არ ხართ ავტორიზებული' });
      }
      
      const userId = req.session.user.id;
      
      console.log('Creating BOG payment order for user:', userId);
      console.log('Order details:', { totalAmount, cartItems: cartItems?.length });

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'კალათა ცარიელია' });
      }

      if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({ error: 'თანხა არასწორია' });
      }

      // Get BOG authentication token
      const token = await getBogAuthToken();
      
      // Generate unique external order ID in BOG's expected format
      const timestamp = Date.now();
      const externalOrderId = `BOG-${timestamp}-${userId}`;
      
      // Prepare order data for BOG
      const orderData = {
        callback_url: `${req.protocol}://${req.get('host')}/api/bog-payment/callback`,
        external_order_id: externalOrderId,
        purchase_units: {
          currency: 'GEL',
          total_amount: totalAmount,
          basket: cartItems.map((item: any, index: number) => ({
            product_id: item.productId || `item-${index}`,
            description: item.productName || item.name || `პროდუქტი ${index + 1}`,
            quantity: item.quantity || 1,
            unit_price: item.price || 0,
            total_price: (item.price || 0) * (item.quantity || 1)
          }))
        },
        redirect_urls: {
          success: `${req.protocol}://${req.get('host')}/payment-success?order_id=${externalOrderId}`,
          fail: `${req.protocol}://${req.get('host')}/payment-failed?order_id=${externalOrderId}`
        },
        buyer: {
          full_name: userInfo?.name || deliveryAddress?.name || 'მყიდველი',
          masked_email: userInfo?.email || 'user@example.com',
          masked_phone: userInfo?.phone || deliveryAddress?.phone || '+995xxxxxxxxx'
        },
        ttl: 30 // 30 minutes to complete payment
      };

      // FIRST: Store order in our database BEFORE creating BOG payment
      console.log('STEP 1: Creating order in database BEFORE BOG payment');
      
      // Generate proper order number 
      const orderNumber = externalOrderId; // Use external ID as order number for consistency
      
      // Calculate delivery method and cost from request body
      const deliveryMethod = req.body.deliveryMethod || 'AIR';
      const shippingCost = req.body.shippingCost || 0;
      
      // Calculate estimated delivery date
      const currentDate = new Date();
      let estimatedDeliveryDate = new Date(currentDate);
      if (deliveryMethod === 'AIR') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 14);
      } else if (deliveryMethod === 'GROUND') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 30);
      } else if (deliveryMethod === 'SEA') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 45);
      }
      
      // Create order in database FIRST
      const [newOrder] = await db.insert(orders).values({
        userId: userId,
        orderNumber: orderNumber,
        totalAmount: Math.round(totalAmount * 100), // Convert to tetri
        shippingCost: Math.round(shippingCost * 100), // Convert to tetri  
        status: 'PENDING',
        paymentMethod: 'BOG',
        deliveryMethod: deliveryMethod,
        estimatedDeliveryDate: estimatedDeliveryDate,
        items: JSON.stringify(cartItems),
        shippingAddress: deliveryAddress?.address || '',
        shippingCity: deliveryAddress?.city || '',
        shippingPostalCode: deliveryAddress?.postalCode || '',
        recipientName: deliveryAddress?.recipient_name || userInfo?.name || '',
        recipientPhone: deliveryAddress?.recipient_phone || userInfo?.phone || '',
        notes: req.body.notes || '',
        bogOrderId: null, // Will be updated after BOG creation
        externalOrderId: externalOrderId,
        deliveryAddress: JSON.stringify(deliveryAddress),
        paymentDetails: JSON.stringify({ pending: true }),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log('STEP 2: Order created in database with ID:', newOrder.id, 'Order Number:', newOrder.orderNumber);
      
      // SECOND: Now create BOG payment
      console.log('STEP 3: Creating BOG payment for existing order');
      const bogResponse = await createBogPaymentOrder(token, orderData);
      
      console.log('STEP 4: BOG order created successfully:', bogResponse.id);
      
      // THIRD: Update the order with BOG details
      console.log('STEP 5: Updating order with BOG payment details');
      await db.update(orders)
        .set({
          bogOrderId: bogResponse.id,
          paymentDetails: JSON.stringify({ bogOrderId: bogResponse.id }),
          updatedAt: new Date()
        })
        .where(eq(orders.id, newOrder.id));
        
      console.log('STEP 6: Order updated with BOG payment details');

      // Return the redirect URL to client
      res.json({
        success: true,
        paymentUrl: bogResponse._links.redirect.href,
        orderId: bogResponse.id,
        externalOrderId: externalOrderId
      });

    } catch (error) {
      console.error('BOG payment order creation failed:', error);
      res.status(500).json({ 
        error: 'გადახდის ორდერის შექმნა ვერ მოხერხდა',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Route to create BOG payment for existing order
  app.post('/api/bog-payment/create-order-payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      const { orderId, totalAmount, deliveryAddress, userInfo } = req.body;

      console.log('Creating BOG payment for existing order:', orderId);

      if (!orderId || !totalAmount) {
        return res.status(400).json({ 
          success: false, 
          message: 'შეკვეთის ID და ღირებულება სავალდებულოა' 
        });
      }

      // Check if order exists and belongs to user
      const [existingOrder] = await db.select()
        .from(orders)
        .where(and(
          eq(orders.id, orderId),
          eq(orders.userId, userId)
        ));

      if (!existingOrder) {
        return res.status(404).json({ 
          success: false, 
          message: 'შეკვეთა ვერ მოიძებნა' 
        });
      }

      // Check if order is already paid
      if (existingOrder.status === 'PAID') {
        return res.status(400).json({ 
          success: false, 
          message: 'ეს შეკვეთა უკვე გადახდილია' 
        });
      }

      // Get BOG authentication token
      console.log('Getting BOG auth token with credentials:', BOG_CLIENT_ID ? 'CLIENT_ID present' : 'CLIENT_ID missing');
      const authToken = await getBogAuthToken();
      console.log('BOG auth token obtained successfully');

      // Generate external order ID in BOG's expected format
      const timestamp = Date.now();
      const externalOrderId = `BOG-${timestamp}-${userId}-${existingOrder.id}`;

      // BOG payment data structure (official BOG API format)
      const bogOrderData = {
        callback_url: `${process.env.FRONTEND_URL?.replace('http://', 'https://') || 'https://localhost:5000'}/api/bog-payment/callback`,
        external_order_id: externalOrderId,
        purchase_units: {
          basket: [
            {
              product_id: existingOrder.id.toString(),
              quantity: 1,
              unit_price: parseFloat((totalAmount / 100).toFixed(2))
            }
          ],
          total_amount: parseFloat((totalAmount / 100).toFixed(2))
        },
        redirect_urls: {
          success: `${process.env.FRONTEND_URL?.replace('http://', 'https://') || 'https://localhost:5000'}/payment-success`,
          fail: `${process.env.FRONTEND_URL?.replace('http://', 'https://') || 'https://localhost:5000'}/payment-failed`
        }
      };

      console.log('BOG order data for existing order:', JSON.stringify(bogOrderData, null, 2));

      // Create BOG payment order
      const bogResponse = await createBogPaymentOrder(authToken, bogOrderData);
      
      if (!bogResponse.id) {
        console.error('BOG response missing id:', bogResponse);
        throw new Error('BOG payment order creation failed');
      }

      console.log('BOG payment order created successfully for existing order:', bogResponse.id);

      // Get payment URL from links
      const paymentUrl = bogResponse._links?.redirect?.href;
      
      if (!paymentUrl) {
        console.error('BOG response missing payment URL:', bogResponse);
        throw new Error('BOG payment URL not found');
      }

      // Update the existing order with BOG payment details
      await db.update(orders)
        .set({
          bogOrderId: bogResponse.id,
          bogPaymentUrl: paymentUrl,
          bogStatus: 'created',
          externalOrderId: externalOrderId,
          deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      console.log('Order updated with BOG payment details');

      res.json({
        success: true,
        paymentUrl: paymentUrl,
        bogOrderId: bogResponse.id,
        externalOrderId: externalOrderId
      });

    } catch (error) {
      console.error('BOG payment creation for existing order failed:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'BOG გადახდის შექმნა ვერ მოხერხდა'
      });
    }
  });

  // Route to handle BOG payment callbacks
  app.post('/api/bog-payment/callback', async (req, res) => {
    try {
      console.log('BOG payment callback received:', req.body);
      
      const callbackData = req.body;
      const orderData = callbackData.body;
      
      if (!orderData || !orderData.order_id) {
        console.error('Invalid callback data received');
        return res.status(400).send('Invalid callback data');
      }

      // Update order status in our database
      try {
        const orderStatus = orderData.order_status?.key;
        const paymentStatus = orderStatus === 'completed' ? 'PAID' : 
                            orderStatus === 'rejected' ? 'FAILED' : 'PENDING';

        // First check if order exists
        const [existingOrder] = await db.select()
          .from(orders)
          .where(eq(orders.externalOrderId, orderData.external_order_id));

        if (existingOrder) {
          // Update existing order
          await db.update(orders)
            .set({
              status: paymentStatus,
              bogOrderId: orderData.order_id,
              paymentDetails: JSON.stringify(orderData),
              updatedAt: new Date()
            })
            .where(eq(orders.externalOrderId, orderData.external_order_id));

          console.log(`Order ${orderData.external_order_id} updated to status: ${paymentStatus}`);
        } else {
          console.log(`Order ${orderData.external_order_id} not found in database, checking if payment was completed`);
          
          // If payment was completed but order doesn't exist, log this issue
          if (orderStatus === 'completed') {
            console.error(`CRITICAL: Payment completed for missing order ${orderData.external_order_id}`);
            console.error('Order data:', JSON.stringify(orderData, null, 2));
            // You might want to send an alert email here
          }
        }
        
        // If payment completed, you can send confirmation emails, notifications etc.
        if (orderStatus === 'completed') {
          console.log('Payment completed successfully for order:', orderData.external_order_id);
          // Add notification/email logic here if needed
        }
        
      } catch (dbError) {
        console.error('Failed to update order in database:', dbError);
      }

      // Always return 200 to confirm callback receipt
      res.status(200).send('Callback processed');

    } catch (error) {
      console.error('BOG payment callback processing failed:', error);
      res.status(500).send('Callback processing failed');
    }
  });

  // Route to check payment status
  app.get('/api/bog-payment/status/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      
      // Get order from our database
      const [order] = await db.select()
        .from(orders)
        .where(and(
          eq(orders.externalOrderId, orderId),
          eq(orders.userId, userId)
        ));

      if (!order) {
        return res.status(404).json({ error: 'ორდერი ვერ მოიძებნა' });
      }

      // Get latest payment details from BOG if we have BOG order ID
      let bogDetails = null;
      if (order.bogOrderId) {
        try {
          const token = await getBogAuthToken();
          bogDetails = await getBogPaymentDetails(token, order.bogOrderId);
        } catch (bogError) {
          console.error('Failed to get BOG payment details:', bogError);
        }
      }

      res.json({
        success: true,
        order: {
          id: order.id,
          externalOrderId: order.externalOrderId,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          paymentDetails: order.paymentDetails ? JSON.parse(order.paymentDetails) : null
        },
        bogDetails: bogDetails
      });

    } catch (error) {
      console.error('Payment status check failed:', error);
      res.status(500).json({ error: 'გადახდის სტატუსის შემოწმება ვერ მოხერხდა' });
    }
  });

  return httpServer;
}
