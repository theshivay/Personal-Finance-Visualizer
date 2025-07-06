/**
 * Category routes
 * Handles all API endpoints for category operations (Stage 2)
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Public
 */
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('type', 'Type must be expense, income, or both').optional().isIn(['expense', 'income', 'both']),
  check('color', 'Color must be a valid hex code').optional().matches(/^#([0-9A-F]{3}){1,2}$/i)
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if category already exists (case insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    // Create new category
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    
    // Return the saved category
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Public
 */
router.put('/:id', [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('type', 'Type must be expense, income, or both').optional().isIn(['expense', 'income', 'both']),
  check('color', 'Color must be a valid hex code').optional().matches(/^#([0-9A-F]{3}){1,2}$/i)
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if trying to update a default category
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Prevent modification of default categories except for color
    if (category.isDefault && (req.body.name || req.body.type)) {
      return res.status(403).json({ message: 'Cannot modify name or type of default categories' });
    }
    
    // Find and update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Prevent deletion of default categories
    if (category.isDefault) {
      return res.status(403).json({ message: 'Cannot delete default categories' });
    }
    
    // Check if category is being used in transactions
    const transactionCount = await Transaction.countDocuments({ category: req.params.id });
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is used in ${transactionCount} transactions.` 
      });
    }
    
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
