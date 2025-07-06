import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../lib/format';

export const BudgetComparisonChart = ({ data }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  // If no data, show placeholder
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-background-light/50 dark:bg-background-dark/80 rounded-lg border border-border-light dark:border-border-dark">
        <p className="text-muted-light dark:text-muted-dark">No budget comparison data available</p>
      </div>
    );
  }

  // Format data for the chart
  const formattedData = safeData.map((item) => ({
    ...item,
    category: item.category || 'Uncategorized',
    budgetAmount: typeof item.budgetAmount === 'number' ? item.budgetAmount : 0,
    actualExpenses: typeof item.actualExpenses === 'number' ? Math.abs(item.actualExpenses) : 0,
    // Add a colorful status indicator based on budget status
    barColor: item.status === 'exceeded' ? '#ef4444' : 
              item.status === 'unbudgeted' ? '#f97316' : '#10b981',
    statusText: item.status === 'exceeded' ? 'Over Budget' :
               item.status === 'unbudgeted' ? 'No Budget' : 'Within Budget'
  }));

  // Custom tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const budgetValue = payload.find(p => p.name === "Budget")?.value || 0;
      const actualValue = payload.find(p => p.name === "Actual")?.value || 0;
      const difference = budgetValue - actualValue;
      const isUnderBudget = difference >= 0;
      
      // Get the data object which has additional properties
      const dataPoint = formattedData.find(d => d.category === label);
      const status = dataPoint?.status || (isUnderBudget ? 'within' : 'exceeded');
      
      return (
        <div className="bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark rounded-lg shadow-md">
          <p className="font-medium text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-1 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground-light dark:text-foreground-dark">{entry.name}: </span>
              <span style={{ color: entry.color }}>{formatCurrency(entry.value)}</span>
            </p>
          ))}
          
          <p className="text-sm mt-1">
            <span className="font-medium">Difference: </span>
            <span style={{ 
              color: status === 'exceeded' ? '#ef4444' : 
                     status === 'unbudgeted' ? '#f97316' : '#10b981' 
            }}>
              {formatCurrency(Math.abs(difference))}
              {isUnderBudget ? ' under budget' : ' over budget'}
            </span>
          </p>
          
          <p className="text-sm mt-1">
            <span className="font-medium">Status: </span>
            <span style={{ 
              color: status === 'exceeded' ? '#ef4444' : 
                     status === 'unbudgeted' ? '#f97316' : '#10b981' 
            }}>
              {dataPoint?.statusText || (isUnderBudget ? 'Within Budget' : 'Over Budget')}
            </span>
          </p>
          
          {dataPoint?.percentage > 0 && (
            <p className="text-sm mt-1">
              <span className="font-medium">Usage: </span>
              <span>{Math.round(dataPoint?.percentage || 0)}%</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formattedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="category" 
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
          height={60}
          tickMargin={10}
          interval={0}
          textAnchor="end"
          angle={-45}
        />
        <YAxis
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip content={customTooltip} />
        <Legend />
        <Bar dataKey="budgetAmount" fill="#3b82f6" name="Budget" />
        <Bar 
          dataKey="actualExpenses" 
          name="Actual" 
          fill="#ef4444"
          fillOpacity={0.8}
        >
          {formattedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                entry.actualExpenses > entry.budgetAmount ? '#ef4444' : 
                entry.budgetAmount === 0 ? '#f97316' : '#10b981'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

BudgetComparisonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      budgetAmount: PropTypes.number,
      actualExpenses: PropTypes.number,
      status: PropTypes.string,
      percentage: PropTypes.number,
    })
  ),
};
