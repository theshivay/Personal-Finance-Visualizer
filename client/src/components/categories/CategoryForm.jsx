import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectOption } from '../ui/select';
import { useCategories } from '../../context/CategoryContext';

// Predefined color options for categories
const COLOR_OPTIONS = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Green', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Orange', value: '#f97316' },
];

export const CategoryForm = ({ category, onSave, onCancel }) => {
  const { addCategory, updateCategory } = useCategories();
  
  const isEditing = !!category?._id;
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || COLOR_OPTIONS[0].value,
    icon: category?.icon || 'default',
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
      if (isEditing) {
        result = await updateCategory(category._id, formData);
      } else {
        result = await addCategory(formData);
      }
      onSave(result);
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors((prev) => ({ ...prev, form: error.message || 'Failed to save category' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'border-red-500' : ''}
          placeholder="Enter category name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <Label htmlFor="color">Color</Label>
        <Select
          id="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
        >
          {COLOR_OPTIONS.map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </Select>
      </div>
      
      <div className="flex items-center mt-2">
        <span className="mr-2">Preview:</span>
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: formData.color }}
        ></div>
        <span className="ml-3 font-medium">{formData.name}</span>
      </div>
      
      {errors.form && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
          {errors.form}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
};

CategoryForm.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
