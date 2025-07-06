import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectOption } from '../ui/select';
import { useTransactions } from '../../context/TransactionContext';
import { useCategories } from '../../context/CategoryContext';

export const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { categories } = useCategories();
  
  const isEditing = !!transaction?._id;
  
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Get categoryId, handling both string and object formats
  const getCategoryId = () => {
    if (!transaction?.categoryId) {
      return safeCategories.length > 0 ? safeCategories[0]._id : '';
    }
    
    // If categoryId is an object with _id property, use that
    if (typeof transaction.categoryId === 'object' && transaction.categoryId !== null) {
      return transaction.categoryId._id;
    }
    
    // Otherwise, use the categoryId directly (string)
    return transaction.categoryId;
  };
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    categoryId: getCategoryId(),
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
      const formattedData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
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
