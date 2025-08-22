import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import path from "path";

const app = express();

// Enable gzip compression for all responses
app.use(compression({
  level: 6, // Compression level (1-9, 6 is default)
  threshold: 1024, // Only compress files larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Fallback to standard filter function
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve ads.txt with proper Content-Type header
app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "ads.txt"));
});

// Serve static files from public directory (for sitemap.xml, robots.txt, etc.)
app.use(express.static(path.resolve(import.meta.dirname, "..", "public")));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  // Only log in development mode and exclude sensitive endpoints
  const shouldLog = process.env.NODE_ENV === "development" && 
    !path.includes("/payments/") &&
    !path.includes("/orders/");

  res.on("finish", async () => {
    const duration = Date.now() - start;
    if (shouldLog && path.startsWith("/api")) {
      // Only log basic request info without response data
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (process.env.NODE_ENV === "development") {
        const { log } = await import("./vite.js");
        log(logLine);
      } else {
        const { log } = await import("./vite-prod.js");
        log(logLine);
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./vite-prod.js");
    serveStatic(app);
  }

  // Use PORT from environment (Render.com sets this) or fallback to 5000 for development
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    if (process.env.NODE_ENV === "development") {
      const { log } = await import("./vite.js");
      log(`serving on port ${port}`);
    } else {
      const { log } = await import("./vite-prod.js");
      log(`Production server running on port ${port}`);
    }
  });
})();
