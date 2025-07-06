import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useCategories } from '../../context/CategoryContext';
import { formatCurrency } from '../../lib/format';

export const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const { categories } = useCategories();
  
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Helper to get category name by ID
  const getCategoryName = (categoryId) => {
    // Handle cases where categoryId could be a string or object
    const id = typeof categoryId === 'object' && categoryId !== null 
      ? categoryId._id 
      : categoryId;
    
    const category = safeCategories.find((cat) => cat._id === id);
    return category ? category.name : 'Uncategorized';
  };
  
  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted">No transactions found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction._id} className="overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="font-medium">{transaction.description}</h3>
              <p className="text-sm text-muted">
                {formatDate(transaction.date)} • {getCategoryName(transaction.categoryId)}
              </p>
            </div>
            <div className="text-right">
              <div className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                {formatCurrency(transaction.amount)}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(transaction)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(transaction._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      categoryId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string.isRequired
        })
      ]),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
