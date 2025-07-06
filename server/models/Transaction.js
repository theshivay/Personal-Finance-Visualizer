/**
 * Transaction Model
 * 
 * Represents a financial transaction in the system with comprehensive details
 * This is a core data model that tracks all money movements (expenses & income)
 * 
 * Schema Design:
 * - Basic transaction details: amount, description, date, type
 * - Relational data: links to categories
 * - Extended properties: payment method, notes
 * - Auto-managed timestamps
 * - Performance-optimized indexes
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  // The monetary value of the transaction
  // Positive for income, negative for expenses in the application logic
  amount: {
    type: Number,
    required: [true, 'Amount is required'], // Validation with custom message
  },
  
  // Brief description of what the transaction was for
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true  // Automatically removes whitespace from both ends
  },
  
  // When the transaction occurred
  date: {
    type: Date,
    default: Date.now, // Uses current date/time if not provided
    required: [true, 'Date is required']
  },
  
  // Distinguishes between money coming in vs going out
  type: {
    type: String,
    enum: ['expense', 'income'], // Restricts to valid transaction types
    default: 'expense'           // Most transactions are expenses
  },
  
  // Reference to the Category model
  categoryId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId reference
    ref: 'Category',                       // Points to Category model
    // Initially optional for Stage 1
    // Will become required in Stage 2
  },
  
  // Fields for future expansion (Stage 3)
  // How the transaction was paid for
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'transfer', 'other'],
    default: 'cash'
  },
  
  // Additional details about the transaction
  notes: {
    type: String,
    trim: true // Remove whitespace from both ends
  }
}, {
  // Schema options
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Database indexes for query optimization:
// 1. Index on date field (descending) for quick date-based lookups and sorting
TransactionSchema.index({ date: -1 });

// 2. Compound index for category + date queries (common filtering pattern)
TransactionSchema.index({ category: 1, date: -1 });

// Export the model to be used in other parts of the application
module.exports = mongoose.model('Transaction', TransactionSchema);
