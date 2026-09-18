import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Routes
import authRoutes     from './routes/authRoutes.js';
import foodRoutes     from './routes/foodRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes    from './routes/orderRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';
import adminRoutes    from './routes/adminRoutes.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Ensure uploads directory exists if filesystem is writable
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  // Read-only filesystem in some serverless environments
}

// Ensure database connection for all requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// CORS configuration (supports single URL, multiple comma-separated URLs, or fallback)
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(u => u.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(origin) ||
      configuredOrigins.some(allowed => origin.startsWith(allowed)) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', {
    skip: (req, res) => res.statusCode === 304
  }));
}

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV }));

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api/auth',       authRoutes);
app.use('/api/food',       foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/admin',      adminRoutes);

// In production standalone mode, serve frontend client build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_, res) => res.json({ app: 'ZYVO Food Delivery API', version: '1.0.0', status: 'running' }));
}

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
