import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency, formatDate } from '../../lib/format';

export const SummaryCard = ({ title, value, icon, change, changeText, changeType = 'neutral', loading = false, highlight = false }) => {
  let cardStyles = {};
  
  // Define card styles based on type
  if (changeType === 'positive') {
    cardStyles = {
      icon: 'bg-gradient-to-br from-emerald-400/30 to-emerald-500/30 text-emerald-500 dark:text-emerald-400',
      changeColor: 'text-emerald-600 dark:text-emerald-400',
      highlight: 'from-emerald-500 to-emerald-600'
    };
  } else if (changeType === 'negative') {
    cardStyles = {
      icon: 'bg-gradient-to-br from-red-400/30 to-red-500/30 text-red-500 dark:text-red-400',
      changeColor: 'text-red-600 dark:text-red-400',
      highlight: 'from-red-500 to-red-600'
    };
  } else {
    cardStyles = {
      icon: 'bg-gradient-to-br from-primary-400/30 to-primary-500/30 text-primary-500 dark:text-primary-400',
      changeColor: 'text-muted-light dark:text-muted-dark',
      highlight: 'from-primary-500 to-primary-600'
    };
  }
  
  return (
    <Card highlight={highlight}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-light dark:text-muted-dark flex items-center gap-2">
          {icon && (
            <div className={`h-8 w-8 rounded-lg ${cardStyles.icon} flex items-center justify-center shadow-md`}>
              {icon}
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-12">
            <div className="animate-pulse flex space-x-4">
              <div className="h-5 w-24 bg-muted-light/20 dark:bg-muted-dark/20 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              {typeof value === 'string' ? value : formatCurrency(value)}
            </div>
            {change !== undefined && (
              <p className={`text-sm mt-2 flex items-center ${cardStyles.changeColor}`}>
                {change > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                ) : change < 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {Math.abs(change)}% {changeText}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  change: PropTypes.number,
  changeText: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  loading: PropTypes.bool,
};

export const RecentTransactionCard = ({ transactions, loading = false }) => {
  const formatTransactionDate = (date) => {
    return formatDate(date, 'short');
  };

  // Ensure transactions is an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted">Loading transactions...</p>
          </div>
        ) : safeTransactions.length === 0 ? (
          <p className="text-muted text-sm">No recent transactions</p>
        ) : (
          <div className="space-y-4">
            {safeTransactions.map((transaction) => (
              <div key={transaction._id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted">{formatTransactionDate(transaction.date)}</p>
                </div>
                <div className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

RecentTransactionCard.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
};

export const CategoryBreakdownCard = ({ categories, loading = false }) => {
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Calculate total expenses
  const total = safeCategories.reduce(
    (sum, category) => sum + Math.abs(category.amount),
    0
  );

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted">Loading categories...</p>
          </div>
        ) : safeCategories.length === 0 ? (
          <p className="text-muted text-sm">No category data available</p>
        ) : (
          <div className="space-y-4">
            {safeCategories.map((category, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <div className="w-full h-2 mt-1 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(category.amount / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>{formatCurrency(category.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

CategoryBreakdownCard.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
};
