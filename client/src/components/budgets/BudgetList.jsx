import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/format';
import { useCategories } from '../../context/CategoryContext';

export const BudgetList = ({ budgets, onEdit, onDelete }) => {
  const { categories } = useCategories();
  
  // Ensure budgets and categories are arrays
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Helper to get category name by ID
  const getCategoryName = (categoryId) => {
    // Handle categoryId as object or string
    const id = typeof categoryId === 'object' && categoryId !== null
      ? categoryId._id 
      : categoryId;
      
    const category = safeCategories.find((cat) => cat._id === id);
    return category ? category.name : 'Uncategorized';
  };
  
  // Helper to get month name
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  
  // Use safeBudgets instead of budgets
  if (!safeBudgets.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted">No budgets found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {safeBudgets.map((budget) => (
        <Card key={budget._id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 sm:items-center">
              <div>
                <h3 className="font-medium">
                  {getCategoryName(budget.categoryId)}
                </h3>
                <p className="text-sm text-muted">
                  {getMonthName(budget.month)} {budget.year}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end">
                <div className="font-bold">
                  {formatCurrency(budget.amount)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(budget)}
                    className="px-3 py-1 h-8"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(budget._id)}
                    className="px-3 py-1 h-8"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            
            {budget.spent !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Spent: {formatCurrency(budget.spent)}</span>
                  <span>
                    {Math.round((budget.spent / budget.amount) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${
                      budget.spent > budget.amount
                        ? 'bg-red-500'
                        : 'bg-primary-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (budget.spent / budget.amount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

BudgetList.propTypes = {
  budgets: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      categoryId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string.isRequired
        })
      ]).isRequired,
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      spent: PropTypes.number
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
