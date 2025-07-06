/**
 * Category model
 * Represents a transaction category (used in Stage 2)
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  color: {
    type: String,
    default: '#6E7582', // Default color for categories
    trim: true
  },
  icon: {
    type: String,
    default: 'tag',
    trim: true
  },
  // To support both expense and income categories
  type: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense'
  },
  // For system-defined vs user-defined categories
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure all category names are unique regardless of case
CategorySchema.pre('save', async function(next) {
  const category = this;
  if (category.isModified('name')) {
    const existingCategory = await mongoose.models.Category.findOne({
      name: { $regex: new RegExp(`^${category.name}$`, 'i') },
      _id: { $ne: category._id }
    });
    
    if (existingCategory) {
      const error = new Error(`Category name '${category.name}' already exists`);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
