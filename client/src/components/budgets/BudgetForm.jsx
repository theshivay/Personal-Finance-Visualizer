import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectOption } from '../ui/select';
import { useBudgets } from '../../context/BudgetContext';
import { useCategories } from '../../context/CategoryContext';
import { getCurrentMonthYear } from '../../lib/format';

export const BudgetForm = ({ budget, onSave, onCancel }) => {
  const { addBudget, updateBudget } = useBudgets();
  const { categories } = useCategories();
  
  const currentDate = getCurrentMonthYear();
  const isEditing = !!budget?._id;
  
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Handle categoryId which could be an object or a string
  const getCategoryId = (category) => {
    if (!category) return '';
    return typeof category === 'object' && category !== null ? category._id : category;
  };
  
  const [formData, setFormData] = useState({
    amount: budget?.amount || '',
    categoryId: getCategoryId(budget?.categoryId) || (safeCategories.length > 0 ? safeCategories[0]._id : ''),
    month: budget?.month || currentDate.month + 1,
    year: budget?.year || currentDate.year,
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!formData.categoryId && safeCategories.length > 0) {
      newErrors.categoryId = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      let result;
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
      };
      
      if (isEditing) {
        result = await updateBudget(budget._id, budgetData);
      } else {
        result = await addBudget(budgetData);
      }
      onSave(result);
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors((prev) => ({ ...prev, form: error.message || 'Failed to save budget' }));
    }
  };
  
  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: i + 1,
      label: date.toLocaleString('default', { month: 'long' }),
    };
  });
  
  // Generate year options (current year and next 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Budget Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          className={errors.amount ? 'border-red-500' : ''}
          placeholder="Enter budget amount"
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
      </div>
      
      {safeCategories.length > 0 && (
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={errors.categoryId ? 'border-red-500' : ''}
          >
            {safeCategories.map((category) => (
              <SelectOption key={category._id} value={category._id}>
                {category.name}
              </SelectOption>
            ))}
          </Select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="month">Month</Label>
          <Select
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
          >
            {months.map((month) => (
              <SelectOption key={month.value} value={month.value}>
                {month.label}
              </SelectOption>
            ))}
          </Select>
        </div>
        
        <div>
          <Label htmlFor="year">Year</Label>
          <Select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
          >
            {years.map((year) => (
              <SelectOption key={year} value={year}>
                {year}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
      
      {errors.form && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
          {errors.form}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
};

BudgetForm.propTypes = {
  budget: PropTypes.shape({
    _id: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    categoryId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string.isRequired
      })
    ]),
    month: PropTypes.number,
    year: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
