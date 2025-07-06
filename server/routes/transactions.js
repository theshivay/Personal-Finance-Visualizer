/**
 * Transaction Routes Module
 * 
 * Handles all API endpoints for transaction CRUD operations
 * Features:
 * - Comprehensive filtering and pagination
 * - Data validation
 * - Category population
 * - Error handling
 * 
 * All endpoints are prefixed with /api/transactions from main server
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // For input validation
const Transaction = require('../models/Transaction');             // Transaction data model

/**
 * GET /api/transactions
 * 
 * Retrieves transactions with advanced filtering, sorting, and pagination
 * 
 * Query Parameters:
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of results per page (default: 10)
 * @param {string} sortBy - Field to sort by (default: date)
 * @param {string} sortOrder - Sort direction: 'asc' or 'desc' (default: desc)
 * @param {string} startDate - Filter transactions after this date (ISO format)
 * @param {string} endDate - Filter transactions before this date (ISO format)
 * @param {string} category - Filter by category ID
 * @param {string} type - Filter by transaction type (expense/income)
 * 
 * @returns {Object} Paginated transaction list with metadata
 */
router.get('/', async (req, res) => {
  try {
    // Extract and parse query parameters with defaults
    const {
      page = 1,          // Current page number
      limit = 10,        // Items per page
      sortBy = 'date',   // Default sort field
      sortOrder = 'desc', // Default sort direction (newest first)
      startDate,         // Optional date range start
      endDate,           // Optional date range end
      category,          // Optional category filter
      type               // Optional transaction type filter
    } = req.query;

    // Build MongoDB filter object based on query parameters
    const filter = {};
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      // Greater than or equal to start date
      if (startDate) filter.date.$gte = new Date(startDate);
      // Less than or equal to end date
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Filter by category if provided
    if (category) filter.categoryId = category;
    
    // Filter by transaction type if provided (expense/income)
    if (type) filter.type = type;

    // Get total count for pagination metadata
    const total = await Transaction.countDocuments(filter);
    
    // Execute main query with all filters, sorting and pagination
    const transactions = await Transaction.find(filter)
      // Dynamic sorting based on query params
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      // Apply pagination
      .limit(limit * 1)  // Convert to number
      .skip((page - 1) * limit)
      // Populate category details instead of just IDs
      .populate('categoryId', 'name color icon')
      .exec();

    // Return structured response with:
    // 1. The actual transaction data
    // 2. Pagination metadata for the client
    res.json({
      transactions,                            // Transaction array
      totalPages: Math.ceil(total / limit),    // Calculate total pages
      currentPage: parseInt(page),             // Current page number
      totalTransactions: total                 // Total count of matching records
    });
  } catch (error) {
    // Log error for server-side debugging
    console.error('Error fetching transactions:', error);
    
    // Return appropriate error response to client
    res.status(500).json({ 
      message: 'Server error while fetching transactions', 
      error: error.message 
    });
  }
});

/**
 * GET /api/transactions/:id
 * 
 * Retrieves a single transaction by its ID
 * 
 * URL Parameters:
 * @param {string} id - MongoDB ObjectId of the transaction
 * 
 * @returns {Object} Transaction object with populated category data
 * @returns {404} If transaction not found
 * @returns {500} If server error occurs
 */
router.get('/:id', async (req, res) => {
  try {
    // Find transaction by ID and populate category details
    const transaction = await Transaction.findById(req.params.id)
      .populate('categoryId', 'name color icon'); // Get category name, color and icon
    
    // Handle case when transaction doesn't exist
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Return the transaction data
    res.json(transaction);
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching transaction:', error);
    
    // Return error response
    // Could be invalid ID format or database error
    res.status(500).json({ 
      message: 'Error retrieving transaction details', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Public
 */
router.post('/', [
  check('amount', 'Amount is required').not().isEmpty(),
  check('amount', 'Amount must be a number').isNumeric(),
  check('description', 'Description is required').not().isEmpty(),
  check('date', 'Valid date is required').isISO8601().toDate(),
  check('type', 'Type must be expense or income').isIn(['expense', 'income'])
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create new transaction
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    
    // Return the saved transaction
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Public
 */
router.put('/:id', [
  check('amount', 'Amount must be a number').optional().isNumeric(),
  check('date', 'Valid date is required').optional().isISO8601().toDate(),
  check('type', 'Type must be expense or income').optional().isIn(['expense', 'income'])
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find and update the transaction
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color icon');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
