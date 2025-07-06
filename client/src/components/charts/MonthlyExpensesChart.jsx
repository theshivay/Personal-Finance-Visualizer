import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMonthName } from '../../lib/format';

export const MonthlyExpensesChart = ({ data }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
        <p className="text-muted">No monthly expenses data available</p>
      </div>
    );
  }
  
  // Handle data format from API - amount field from API becomes expenses for the chart
  const formattedData = safeData.map((item) => {
    // Make sure month is a valid number between 1-12
    const monthNum = typeof item.month === 'number' && item.month >= 1 && item.month <= 12 
      ? item.month 
      : 1;
      
    // Get the expense value, defaulting to 0 if neither exists
    const expenseValue = typeof item.amount === 'number' 
      ? Math.abs(item.amount) 
      : (typeof item.expenses === 'number' ? Math.abs(item.expenses) : 0);
      
    return {
      name: item.name || '',
      month: getMonthName(monthNum - 1, 'short'),
      expenses: expenseValue,
      originalMonth: monthNum,
    };
  });

  // Sort by original month
  const sortedData = [...formattedData].sort((a, b) => a.originalMonth - b.originalMonth);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={sortedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, 'Expenses']}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb',
            borderRadius: '4px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar 
          dataKey="expenses" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

MonthlyExpensesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.number,
      // Data can contain either amount (from API) or expenses (from component)
      name: PropTypes.string,
      amount: PropTypes.number,
      expenses: PropTypes.number,
    })
  ).isRequired,
};
