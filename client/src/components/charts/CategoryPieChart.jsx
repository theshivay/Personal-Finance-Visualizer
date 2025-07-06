/**
 * CategoryPieChart Component
 * 
 * A visualization component that displays spending distribution across categories
 * using a pie chart. Features include:
 * - Interactive segments with hover effects
 * - Percentage labels for significant categories
 * - Custom tooltips with detailed information
 * - Responsive design that works in any container
 * - Error states for missing or invalid data
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  PieChart,     // Chart container
  Pie,          // Actual pie chart
  Cell,         // Individual pie segments
  ResponsiveContainer, // Wrapper for responsive design
  Legend,       // Chart legend
  Tooltip,      // Hover tooltips
} from 'recharts';
import { formatCurrency } from '../../lib/format';

/**
 * Predefined color palette for category visualization
 * Each color represents a different category in the pie chart
 * Colors are chosen for:
 * - Accessibility (distinct even for color vision deficiency)
 * - Visual harmony
 * - Contrast with white text
 */
const COLORS = [
  '#6366f1', // indigo/primary
  '#10b981', // emerald/accent
  '#f97316', // orange
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#84cc16', // lime
  '#ef4444', // red
  '#3b82f6', // blue
];

/**
 * Category Pie Chart component
 * Visualizes spending distribution across different categories
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of category data objects with name and amount
 * @returns {JSX.Element} Rendered chart or placeholder
 */
export const CategoryPieChart = ({ data }) => {
  /**
   * Defensive programming: ensure data is always an array
   * This prevents runtime errors if data is null, undefined, or not an array
   */
  const safeData = Array.isArray(data) ? data : [];
  
  /**
   * Handle empty data case
   * Show a user-friendly message instead of an empty chart
   */
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-background-light/50 dark:bg-background-dark/80 rounded-lg border border-border-light dark:border-border-dark">
        <p className="text-muted-light dark:text-muted-dark">No category data available</p>
      </div>
    );
  }

  /**
   * Calculate the total amount across all categories
   * This is used to determine the percentage for each category
   * Takes care to handle non-numeric values by defaulting to 0
   */
  const total = safeData.reduce((sum, item) => {
    // Ensure amount is a number to prevent NaN errors
    const amount = typeof item.amount === 'number' ? item.amount : 0;
    // Use absolute value to handle negative amounts correctly
    return sum + Math.abs(amount);
  }, 0);
  
  /**
   * Transform raw data into the format required by the chart component
   * - Filter out invalid or zero entries
   * - Format all values consistently
   * - Calculate percentage for each category
   */
  const formattedData = safeData
    // Remove invalid entries (non-numeric or zero amounts)
    .filter(item => typeof item.amount === 'number' && item.amount !== 0)
    // Map each entry to the format required by Recharts
    .map((item) => ({
      name: item.name || 'Unknown', // Use 'Unknown' as fallback for missing names
      value: Math.abs(item.amount), // Convert to absolute value for the chart
      percentage: ((Math.abs(item.amount) / total) * 100).toFixed(1), // Calculate & format percentage
    }));

  /**
   * Handle the case where all data was filtered out
   * This could happen if all entries had invalid amounts
   */
  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-background-light/50 dark:bg-background-dark/80 rounded-lg border border-border-light dark:border-border-dark">
        <p className="text-muted-light dark:text-muted-dark">No valid category data available</p>
      </div>
    );
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    fill,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    // Only show label for segments that are large enough (more than 5%)
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white" // White text stands out well on all color backgrounds
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        stroke="none" // No stroke for cleaner text
        className="chart-label" // Allow potential CSS styling
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Custom tooltip with dark mode support
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const color = payload[0]?.color || '#6366f1';
      return (
        <div className="bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark rounded-lg shadow-md">
          <p className="font-medium text-foreground-light dark:text-foreground-dark border-b border-border-light dark:border-border-dark pb-2 mb-2">{payload[0].name}</p>
          <div className="space-y-1">
            <p className="flex items-center justify-between">
              <span className="font-medium text-muted-light dark:text-muted-dark">Amount: </span>
              <span className="font-bold text-foreground-light dark:text-foreground-dark" style={{ color }}>
                {formatCurrency(payload[0].value)}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-muted-light dark:text-muted-dark">Percentage: </span>
              <span className="font-bold text-foreground-light dark:text-foreground-dark" style={{ color }}>
                {payload[0].payload.percentage}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => <span className="text-sm text-foreground-light dark:text-foreground-dark font-medium">{value}</span>}
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

CategoryPieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
};
