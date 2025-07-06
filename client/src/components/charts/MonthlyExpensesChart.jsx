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
      <div className="flex items-center justify-center h-[300px] bg-background-light/50 dark:bg-background-dark/80 rounded-lg border border-border-light dark:border-border-dark">
        <p className="text-muted-light dark:text-muted-dark">No monthly expenses data available</p>
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
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="var(--chart-grid-color, #e5e7eb)" 
          opacity={0.3}
        />
        <XAxis 
          dataKey="month" 
          axisLine={{ stroke: 'var(--chart-axis-color, #e5e7eb)' }}
          tick={{ fill: 'var(--chart-text-color, #1f2937)' }}
          tickLine={false}
        />
        <YAxis
          axisLine={{ stroke: 'var(--chart-axis-color, #e5e7eb)' }}
          tick={{ fill: 'var(--chart-text-color, #1f2937)' }}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, 'Expenses']}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            color: 'var(--tooltip-text, #1f2937)',
            borderColor: 'var(--tooltip-border, #e5e7eb)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          cursor={{ fill: 'var(--chart-hover-color, rgba(99, 102, 241, 0.1))' }}
        />
        <Bar 
          dataKey="expenses" 
          fill="var(--chart-bar-color, #6366f1)" 
          radius={[6, 6, 0, 0]}
          animationDuration={800}
          animationEasing="ease-in-out"
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
