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
        <Card key={transaction._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              {/* Transaction type icon */}
              <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                transaction.amount < 0 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' 
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400'
              }`}>
                {transaction.amount < 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-medium text-foreground-light dark:text-foreground-dark truncate mr-2">
                    {transaction.description}
                  </h3>
                  <div className={`text-lg font-semibold ${
                    transaction.amount < 0 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-emerald-500 dark:text-emerald-400'
                  } sm:hidden`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-xs text-muted-light dark:text-muted-dark flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(transaction.date)}
                  </span>
                  <span className="text-xs text-muted-light dark:text-muted-dark mx-1">•</span>
                  <span className="text-xs text-muted-light dark:text-muted-dark flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate max-w-[140px]">{getCategoryName(transaction.categoryId)}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:text-right flex sm:block items-center justify-between">
              <div className="sm:mb-2 hidden sm:block">
                <div className={`text-lg font-semibold ${
                  transaction.amount < 0 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-emerald-500 dark:text-emerald-400'
                }`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              <div className="flex gap-2 sm:mt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(transaction)}
                  className="border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-2 sm:px-3 py-1 h-8 touch-target"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span className="text-sm">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(transaction._id)}
                  className="border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 sm:px-3 py-1 h-8 touch-target"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Delete</span>
                </Button>
              </div>
            </div>
          </div>
          {/* Additional info section */}
          <div className="px-4 py-2 bg-background-light/50 dark:bg-background-dark/50">
            <div className="text-xs text-muted-light dark:text-muted-dark">
              {transaction.notes ? transaction.notes : 'No additional notes'}
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
