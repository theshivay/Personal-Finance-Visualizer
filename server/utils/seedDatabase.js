/**
 * Database seed script
 * Populates initial categories for the finance tracker
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

// Default expense categories
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: 'utensils', type: 'expense', isDefault: true },
  { name: 'Transportation', color: '#4ECDC4', icon: 'car', type: 'expense', isDefault: true },
  { name: 'Housing', color: '#45B7D1', icon: 'home', type: 'expense', isDefault: true },
  { name: 'Utilities', color: '#FFA5AB', icon: 'bolt', type: 'expense', isDefault: true },
  { name: 'Entertainment', color: '#FFBE0B', icon: 'film', type: 'expense', isDefault: true },
  { name: 'Shopping', color: '#9381FF', icon: 'shopping-bag', type: 'expense', isDefault: true },
  { name: 'Health & Medical', color: '#FB5607', icon: 'medkit', type: 'expense', isDefault: true },
  { name: 'Personal Care', color: '#8AC926', icon: 'spa', type: 'expense', isDefault: true },
  { name: 'Education', color: '#1982C4', icon: 'graduation-cap', type: 'expense', isDefault: true },
  { name: 'Travel', color: '#6A4C93', icon: 'plane', type: 'expense', isDefault: true },
  { name: 'Gifts & Donations', color: '#FF595E', icon: 'gift', type: 'expense', isDefault: true },
  { name: 'Business', color: '#8EBBFF', icon: 'briefcase', type: 'expense', isDefault: true },
  { name: 'Investments', color: '#52B788', icon: 'chart-line', type: 'expense', isDefault: true },
  { name: 'Other', color: '#6E7582', icon: 'ellipsis-h', type: 'expense', isDefault: true },
  
  // Income categories
  { name: 'Salary', color: '#52B788', icon: 'wallet', type: 'income', isDefault: true },
  { name: 'Freelance', color: '#4CC9F0', icon: 'laptop-code', type: 'income', isDefault: true },
  { name: 'Investment Income', color: '#8AC926', icon: 'chart-line', type: 'income', isDefault: true },
  { name: 'Gifts Received', color: '#FF595E', icon: 'gift', type: 'income', isDefault: true },
  { name: 'Other Income', color: '#6E7582', icon: 'ellipsis-h', type: 'income', isDefault: true },
];

/**
 * Seed the database with initial categories
 */
async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
    
    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} categories. Skipping seed.`);
      process.exit(0);
    }
    
    // Insert categories
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log(`${DEFAULT_CATEGORIES.length} categories seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
