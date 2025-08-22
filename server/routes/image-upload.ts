import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Make sure we have a directory for storing uploaded images
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    // Create directory recursively
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }
}

// Configure multer for file storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Create upload middleware
const upload = multer({ 
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
}).single('file');

// We'll use the actual uploaded image URL with the API

// Handler for image uploads
export const uploadImageHandler = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    try {
      // Get the file path
      const filename = req.file.filename;
      
      // Generate an absolute URL for the uploaded image
      // We need a fully qualified URL for the API to access it
      const host = req.get('host');
      const protocol = req.protocol;
      const publicImageUrl = `${protocol}://${host}/uploads/${filename}`;
      
      console.log(`Image uploaded to ${publicImageUrl} - using this URL for API search`);
      
      // Return success with the actual image URL for search
      return res.status(200).json({
        success: true,
        url: publicImageUrl, // Use the actual uploaded image URL for search
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      
      // Return an error message
      return res.status(400).json({
        success: false,
        error: "სურათის ატვირთვა ვერ მოხერხდა, გთხოვთ სცადოთ თავიდან."
      });
    }
  });
};