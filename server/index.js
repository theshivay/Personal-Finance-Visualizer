/**
 * Main application entry point for the Personal Finance Visualizer server
 * Sets up Express server with middleware and routes
 * 
 * This file coordinates all server functionality by:
 * - Loading environment variables from .env
 * - Creating the Express application
 * - Connecting to MongoDB database
 * - Setting up security middleware (CORS, Helmet)
 * - Configuring logging and request parsing
 * - Registering API routes
 * - Handling errors
 * - Starting the HTTP server
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');  // Web server framework
const cors = require('cors');        // Cross-Origin Resource Sharing middleware
const helmet = require('helmet');    // Security middleware
const morgan = require('morgan');    // HTTP request logger
const mongoose = require('mongoose'); // MongoDB ODM

// Import route modules for API endpoints
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express application
const app = express();

// Define server port from environment variables or use default
const PORT = process.env.PORT || 5001;

// Connect to MongoDB database
// Uses connection string from environment variable or fallback to local database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    // Exit process with failure if database connection fails
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with error code
  });

// Configure application middleware stack
// 1. Security middleware
app.use(helmet()); // Add security headers to protect against common vulnerabilities

// 2. CORS configuration to allow cross-origin requests from client applications
app.use(cors());
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow React development servers
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],                  // Allowed HTTP methods
//   credentials: true,                                          // Allow cookies and authentication
// }));

// 3. Request logging
app.use(morgan('dev')); // Log HTTP requests in development format

// 4. Request body parsers
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Register API Routes - each path is handled by a dedicated router module
app.use('/api/transactions', transactionRoutes);  // Transaction CRUD operations
app.use('/api/categories', categoryRoutes);       // Category management
app.use('/api/budgets', budgetRoutes);            // Budget planning and tracking
app.use('/api/analytics', analyticsRoutes);       // Financial analytics and reporting

// Root route - simple health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Personal Finance Visualizer API is running' });
});

// Global error handling middleware
// Catches any errors thrown during request processing
app.use((err, req, res, next) => {
  // Log error for server-side debugging
  console.error(err.stack);
  
  // Send appropriate response to client
  // Hide implementation details in production for security
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
