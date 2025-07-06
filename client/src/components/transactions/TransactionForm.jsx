/**
 * TransactionForm Component
 * 
 * A form component for creating and editing financial transactions
 * Features:
 * - Support for both new transactions and editing existing ones
 * - Form validation with error messages
 * - Integration with transaction and category contexts
 * - Date formatting and handling
 * - Proper error handling for API calls
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';         // Reusable button component
import { Input } from '../ui/input';           // Reusable input field
import { Label } from '../ui/label';           // Reusable form label
import { Select, SelectOption } from '../ui/select'; // Dropdown component
import { useTransactions } from '../../context/TransactionContext'; // Transaction state management
import { useCategories } from '../../context/CategoryContext';      // Categories state management

/**
 * Transaction Form Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.transaction - Existing transaction data (for editing mode)
 * @param {Function} props.onSave - Callback after successful save
 * @param {Function} props.onCancel - Callback for form cancellation
 * @returns {JSX.Element} The rendered form
 */
export const TransactionForm = ({ transaction, onSave, onCancel }) => {
  // Get transaction management functions from context
  const { addTransaction, updateTransaction } = useTransactions();
  // Get available categories from context
  const { categories } = useCategories();
  
  // Determine if we're editing an existing transaction or creating a new one
  const isEditing = !!transaction?._id;
  
  // Defensive programming: ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  /**
   * Extract category ID from transaction data
   * Handles different data formats that might come from the API
   * @returns {string} The category ID or empty string
   */
  const getCategoryId = () => {
    // If no transaction or no categoryId, use first available category or empty string
    if (!transaction?.categoryId) {
      return safeCategories.length > 0 ? safeCategories[0]._id : '';
    }
    
    // Handle case when categoryId is a populated object (from MongoDB population)
    if (typeof transaction.categoryId === 'object' && transaction.categoryId !== null) {
      return transaction.categoryId._id;
    }
    
    // Handle case when categoryId is just the ID string
    return transaction.categoryId;
  };
  
  /**
   * Form state with default values
   * Uses transaction data if in edit mode, otherwise empty values
   */
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',  // Transaction amount
    description: transaction?.description || '', // Transaction description
    
    // Format date as YYYY-MM-DD for HTML date input
    // Use existing date or today as default
    date: transaction?.date 
      ? new Date(transaction.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
      
    categoryId: getCategoryId(), // Category selection
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount && formData.amount !== 0) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) === 0) {
      newErrors.amount = 'Amount cannot be zero';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.categoryId && safeCategories.length > 0) {
      newErrors.categoryId = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for amount to support both expense and income
    if (name === 'amount') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear the error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Determine transaction type based on amount
      const amount = parseFloat(formData.amount);
      const type = amount >= 0 ? 'income' : 'expense';
      
      const formattedData = {
        ...formData,
        amount: amount,
        type: type, // Explicitly set the type field
      };
      
      console.log('Sending transaction data:', formattedData);
      
      let result;
      if (isEditing) {
        result = await updateTransaction(transaction._id, formattedData);
      } else {
        result = await addTransaction(formattedData);
      }
      onSave(result);
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors((prev) => ({ ...prev, form: error.message || 'Failed to save transaction' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          className={errors.amount ? 'border-red-500' : ''}
          placeholder="Enter amount (negative for expense, positive for income)"
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'border-red-500' : ''}
          placeholder="Enter description"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'border-red-500' : ''}
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>
      
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={errors.categoryId ? 'border-red-500' : ''}
        >
          {safeCategories.length === 0 && (
            <SelectOption value="" disabled>
              No categories available
            </SelectOption>
          )}
          {safeCategories.map((category) => (
            <SelectOption key={category._id} value={category._id}>
              {category.name}
            </SelectOption>
          ))}
        </Select>
        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
      </div>
      
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  );
};

TransactionForm.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string,
    amount: PropTypes.number,
    description: PropTypes.string,
    date: PropTypes.string,
    categoryId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string.isRequired
      })
    ]),
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
