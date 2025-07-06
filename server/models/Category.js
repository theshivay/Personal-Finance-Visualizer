/**
 * Category Model
 * 
 * Defines the schema for transaction categories in the financial tracking system.
 * Categories provide a way to organize and group transactions for reporting,
 * budgeting, and analytics purposes.
 * 
 * Features:
 * - Name validation with uniqueness constraint
 * - Visual properties (color, icon) for UI representation
 * - Support for both expense and income categorization
 * - Distinction between default (system) and custom (user) categories
 * - Automatic timestamps for auditing
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Category Schema Definition
 * 
 * Structure for storing category information in MongoDB
 */
const CategorySchema = new Schema({
  /**
   * Category name - primary identifier visible to users
   * Must be unique across the system (case-insensitive uniqueness enforced via pre-save hook)
   */
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,         // Remove whitespace
    unique: true        // Enforce uniqueness at database level
  },
  
  /**
   * Visual color for the category
   * Used in UI elements like charts, badges, and category lists
   * Stored as hex color code
   */
  color: {
    type: String,
    default: '#6E7582', // Neutral gray default color
    trim: true          // Remove whitespace
  },
  
  /**
   * Icon identifier for visual representation
   * References icon names in the UI component system (likely Lucide icons)
   */
  icon: {
    type: String,
    default: 'tag',     // Default icon name
    trim: true          // Remove whitespace
  },
  
  /**
   * Category type - determines where this category can be used
   * - expense: Only for expense transactions
   * - income: Only for income transactions
   * - both: Can be used for either type
   */
  type: {
    type: String,
    enum: ['expense', 'income', 'both'], // Restricted to valid values
    default: 'expense'                   // Most categories are for expenses
  },
  
  /**
   * Indicates if this is a system-provided default category
   * - true: Pre-defined category, typically protected from deletion
   * - false: User-created custom category
   */
  isDefault: {
    type: Boolean,
    default: false      // Most categories will be user-created
  }
}, {
  timestamps: true      // Automatically add createdAt and updatedAt fields
});

/**
 * Pre-save hook for case-insensitive uniqueness validation
 * 
 * Mongoose's built-in 'unique' property is case-sensitive, but we want
 * category names to be unique regardless of case (e.g., "Food" and "food"
 * should be considered the same category).
 * 
 * This hook runs before each document save and:
 * 1. Checks if the name field is being modified
 * 2. Searches for existing categories with the same name (case-insensitive)
 * 3. Excludes the current document from the search (for updates)
 * 4. Rejects the save operation if a duplicate is found
 */
CategorySchema.pre('save', async function(next) {
  const category = this;
  
  // Only perform this check if the name field is being modified
  if (category.isModified('name')) {
    // Case-insensitive search using RegExp
    // The pattern matches the exact string but ignores case
    const existingCategory = await mongoose.models.Category.findOne({
      name: { $regex: new RegExp(`^${category.name}$`, 'i') },
      _id: { $ne: category._id } // Exclude this document (important for updates)
    });
    
    // If we found a match, reject the save with an error
    if (existingCategory) {
      const error = new Error(`Category name '${category.name}' already exists`);
      return next(error);
    }
  }
  
  // No duplicates found, proceed with save
  next();
});

// Export the model to be used elsewhere in the application
module.exports = mongoose.model('Category', CategorySchema);
