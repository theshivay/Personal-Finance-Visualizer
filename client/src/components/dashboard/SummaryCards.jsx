import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency, formatDate } from '../../lib/format';

export const SummaryCard = ({ title, value, icon, change, changeText, changeType = 'neutral', loading = false }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-12">
            <p className="text-sm text-muted">Loading...</p>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold">
                {typeof value === 'string' ? value : formatCurrency(value)}
              </div>
              {change !== undefined && (
                <p className={`text-sm ${
                  changeType === 'positive' ? 'text-green-600' : 
                  changeType === 'negative' ? 'text-red-600' : 'text-muted'
                }`}>
                  {change > 0 ? '+' : ''}{change}% {changeText}
                </p>
              )}
            </div>
            {icon && (
              <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                {icon}
              </div>
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
