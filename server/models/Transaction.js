/**
 * Transaction model
 * Represents a financial transaction in the system
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Date is required']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    // Initially optional for Stage 1
    // Will become required in Stage 2
  },
  // Fields for future expansion (Stage 3)
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'transfer', 'other'],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for faster queries on common filters
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
