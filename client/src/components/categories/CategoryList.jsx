import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export const CategoryList = ({ categories, onEdit, onDelete }) => {
  if (categories.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-muted">No categories found</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category._id} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              ></div>
              <h3 className="font-medium">{category.name}</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(category)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(category._id)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
