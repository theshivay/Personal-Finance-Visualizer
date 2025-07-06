/**
 * Budget routes
 * Handles all API endpoints for budget operations (Stage 3)
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Budget = require('../models/Budget');

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets with optional filtering by month/year
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Month/year filter
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    
    // Execute query with population
    const budgets = await Budget.find(filter)
      .populate('categoryId', 'name color icon type')
      .sort({ 'categoryId.name': 1 });
    
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/budgets/:id
 * @desc    Get budget by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('categoryId', 'name color icon type');
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget
 * @access  Public
 */
router.post('/', [
  check('categoryId', 'Category is required').not().isEmpty(),
  check('amount', 'Amount is required').not().isEmpty(),
  check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
  check('month', 'Month is required').isInt({ min: 1, max: 12 }),
  check('year', 'Year is required').isInt({ min: 2000, max: 2100 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if budget already exists for this category/month/year
    const existingBudget = await Budget.findOne({
      category: req.body.category,
      month: req.body.month,
      year: req.body.year
    });
    
    if (existingBudget) {
      return res.status(400).json({ 
        message: 'Budget already exists for this category and month/year' 
      });
    }
    
    // Create new budget
    const newBudget = new Budget(req.body);
    const savedBudget = await newBudget.save();
    
    // Populate category details and return
    const populatedBudget = await Budget.findById(savedBudget._id)
      .populate('category', 'name color icon type');
    
    res.status(201).json(populatedBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update a budget
 * @access  Public
 */
router.put('/:id', [
  check('amount', 'Amount must be a positive number').optional().isFloat({ min: 0 }),
  check('month', 'Month must be between 1-12').optional().isInt({ min: 1, max: 12 }),
  check('year', 'Year must be valid').optional().isInt({ min: 2000, max: 2100 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check for uniqueness constraint if changing category, month or year
    if (req.body.category || req.body.month || req.body.year) {
      const budget = await Budget.findById(req.params.id);
      
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      
      const existingBudget = await Budget.findOne({
        category: req.body.category || budget.category,
        month: req.body.month || budget.month,
        year: req.body.year || budget.year,
        _id: { $ne: req.params.id }
      });
      
      if (existingBudget) {
        return res.status(400).json({ 
          message: 'Budget already exists for this category and month/year' 
        });
      }
    }
    
    // Find and update the budget
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name color icon type');
    
    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
