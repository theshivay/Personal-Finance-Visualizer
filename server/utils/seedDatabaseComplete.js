/**
 * Comprehensive database seed script
 * Populates categories, transactions, and budgets for the finance tracker
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
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

// Generate dates for the past few months
function getDateMonthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Seed the database with initial data
 */
async function seedDatabaseComplete() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
    
    // Drop the budgets collection completely to rebuild with the correct schema
    try {
      await mongoose.connection.db.collection('budgets').drop();
      console.log('Dropped budgets collection to rebuild with correct schema');
    } catch (err) {
      console.log('No budgets collection to drop or error dropping:', err.message);
    }
    
    // Note: We're not clearing categories and transactions here to preserve user data
    // If you want a complete reset, uncomment these:
    // await Category.deleteMany({});
    // await Transaction.deleteMany({});
    
    // Check if categories already exist and create if they don't
    const existingCategoryCount = await Category.countDocuments();
    let categories;
    
    if (existingCategoryCount === 0) {
      // Insert categories
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
      console.log(`${categories.length} categories seeded successfully`);
    } else {
      console.log(`${existingCategoryCount} categories already exist. Using existing categories.`);
      categories = await Category.find();
    }
    
    // Check if transactions exist
    const existingTransCount = await Transaction.countDocuments();
    if (existingTransCount > 0) {
      console.log(`${existingTransCount} transactions already exist. Skipping transaction seeding.`);
    } else {
      // Create sample transactions - get category IDs by category name
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name] = cat._id;
      });
      
      // Sample transactions for the past 6 months
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      const sampleTransactions = [
        // This month's transactions
        {
          amount: -85.75,
          description: 'Grocery shopping',
          date: new Date(currentYear, currentMonth, 5),
          type: 'expense',
          categoryId: categoryMap['Food & Dining'],
          paymentMethod: 'credit'
        },
        {
          amount: -45.00,
          description: 'Gas station',
          date: new Date(currentYear, currentMonth, 7),
          type: 'expense',
          categoryId: categoryMap['Transportation'],
          paymentMethod: 'debit'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: new Date(currentYear, currentMonth, 1),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -120.50,
          description: 'Internet bill',
          date: new Date(currentYear, currentMonth, 10),
          type: 'expense',
          categoryId: categoryMap['Utilities'],
          paymentMethod: 'debit'
        },
        {
          amount: -65.00,
          description: 'Movie night',
          date: new Date(currentYear, currentMonth, 15),
          type: 'expense',
          categoryId: categoryMap['Entertainment'],
          paymentMethod: 'cash'
        },
        
        // Last month's transactions
        {
          amount: -950.00,
          description: 'Rent payment',
          date: getDateMonthsAgo(1),
          type: 'expense',
          categoryId: categoryMap['Housing'],
          paymentMethod: 'transfer'
        },
        {
          amount: -78.35,
          description: 'Dinner with friends',
          date: getDateMonthsAgo(1),
          type: 'expense',
          categoryId: categoryMap['Food & Dining'],
          paymentMethod: 'credit'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: getDateMonthsAgo(1),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -200.00,
          description: 'New clothes',
          date: getDateMonthsAgo(1),
          type: 'expense',
          categoryId: categoryMap['Shopping'],
          paymentMethod: 'credit'
        },
        
        // 2 months ago
        {
          amount: -950.00,
          description: 'Rent payment',
          date: getDateMonthsAgo(2),
          type: 'expense',
          categoryId: categoryMap['Housing'],
          paymentMethod: 'transfer'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: getDateMonthsAgo(2),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -55.75,
          description: 'Pharmacy',
          date: getDateMonthsAgo(2),
          type: 'expense',
          categoryId: categoryMap['Health & Medical'],
          paymentMethod: 'debit'
        },
        {
          amount: 250.00,
          description: 'Freelance project',
          date: getDateMonthsAgo(2),
          type: 'income',
          categoryId: categoryMap['Freelance'],
          paymentMethod: 'transfer'
        },
        
        // 3 months ago
        {
          amount: -950.00,
          description: 'Rent payment',
          date: getDateMonthsAgo(3),
          type: 'expense',
          categoryId: categoryMap['Housing'],
          paymentMethod: 'transfer'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: getDateMonthsAgo(3),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -310.25,
          description: 'Flight tickets',
          date: getDateMonthsAgo(3),
          type: 'expense',
          categoryId: categoryMap['Travel'],
          paymentMethod: 'credit'
        },
        
        // 4 months ago
        {
          amount: -950.00,
          description: 'Rent payment',
          date: getDateMonthsAgo(4),
          type: 'expense',
          categoryId: categoryMap['Housing'],
          paymentMethod: 'transfer'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: getDateMonthsAgo(4),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -42.99,
          description: 'Online course',
          date: getDateMonthsAgo(4),
          type: 'expense',
          categoryId: categoryMap['Education'],
          paymentMethod: 'credit'
        },
        
        // 5 months ago
        {
          amount: -950.00,
          description: 'Rent payment',
          date: getDateMonthsAgo(5),
          type: 'expense',
          categoryId: categoryMap['Housing'],
          paymentMethod: 'transfer'
        },
        {
          amount: 3500.00,
          description: 'Monthly salary',
          date: getDateMonthsAgo(5),
          type: 'income',
          categoryId: categoryMap['Salary'],
          paymentMethod: 'transfer'
        },
        {
          amount: -89.99,
          description: 'Gym membership',
          date: getDateMonthsAgo(5),
          type: 'expense',
          categoryId: categoryMap['Personal Care'],
          paymentMethod: 'debit'
        }
      ];
      
      // Insert transactions
      const transactions = await Transaction.insertMany(sampleTransactions);
      console.log(`${transactions.length} transactions seeded successfully`);
    }
    
    // Check if budgets exist
    const existingBudgetCount = await Budget.countDocuments();
    if (existingBudgetCount > 0) {
      console.log(`${existingBudgetCount} budgets already exist. Skipping budget seeding.`);
    } else {
      // Create budgets for the current month and year
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      
      // Get category IDs by name if not done already
      let categoryMap = {};
      if (!categories) {
        categories = await Category.find();
      }
      categories.forEach(cat => {
        categoryMap[cat.name] = cat._id;
      });
      
      // Debug log to check Budget model
      console.log('Budget schema fields:', Object.keys(Budget.schema.paths));
      
      const sampleBudgets = [
        {
          // Use both field names to ensure compatibility
          categoryId: categoryMap['Food & Dining'],
          category: categoryMap['Food & Dining'], // Original field name in database
          amount: 400,
          month: currentMonth,
          year: currentYear,
          notes: 'Monthly grocery and dining budget'
        },
        {
          categoryId: categoryMap['Housing'],
          category: categoryMap['Housing'],
          amount: 1000,
          month: currentMonth,
          year: currentYear,
          notes: 'Rent and utilities'
        },
        {
          categoryId: categoryMap['Transportation'],
          category: categoryMap['Transportation'],
          amount: 200,
          month: currentMonth,
          year: currentYear,
          notes: 'Gas and public transit'
        },
        {
          categoryId: categoryMap['Entertainment'],
          category: categoryMap['Entertainment'],
          amount: 150,
          month: currentMonth,
          year: currentYear,
          notes: 'Movies, games, and fun activities'
        },
        {
          categoryId: categoryMap['Shopping'],
          category: categoryMap['Shopping'],
          amount: 200,
          month: currentMonth,
          year: currentYear,
          notes: 'Clothing and misc shopping'
        }
      ];
      
      // Insert budgets
      const budgets = await Budget.insertMany(sampleBudgets);
      console.log(`${budgets.length} budgets seeded successfully`);
    }
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabaseComplete();
