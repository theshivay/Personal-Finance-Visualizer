/**
 * Transaction routes
 * Handles all API endpoints for transaction CRUD operations
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with pagination and filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      category,
      type
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Category filter
    if (category) filter.categoryId = category;
    
    // Type filter (expense/income)
    if (type) filter.type = type;

    // Count total documents for pagination
    const total = await Transaction.countDocuments(filter);
    
    // Execute query with pagination and sorting
    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('categoryId', 'name color icon')
      .exec();

    // Return paginated results
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTransactions: total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('category', 'name color icon');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    ).populate('category', 'name color icon');
    
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
