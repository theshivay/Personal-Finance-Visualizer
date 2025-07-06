/**
 * Formatting Utilities Module
 * 
 * This module provides consistent formatting functions used throughout the application
 * for formatting currencies, dates, and other data types.
 */

/**
 * Format a number as a currency string
 * 
 * Converts numeric values into properly formatted currency strings
 * with the appropriate currency symbol, thousands separators,
 * and decimal places. Uses the browser's Intl API for locale-aware
 * formatting.
 * 
 * @param {number} amount - The monetary amount to format
 * @param {string} [currency='USD'] - The ISO currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns {string} - Formatted currency string (e.g., "$1,234.56")
 * 
 * @example
 * formatCurrency(1234.56)       // Returns "$1,234.56"
 * formatCurrency(1000, 'EUR')   // Returns "€1,000.00"
 * formatCurrency(null)          // Returns "$0.00" (safe handling of invalid input)
 */
export const formatCurrency = (amount, currency = 'USD') => {
  // Defensive programming: handle invalid inputs by returning a safe default
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  
  // Use browser's Internationalization API for consistent formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',      // Format as currency
    currency,               // Use specified currency code
    minimumFractionDigits: 2, // Always show 2 decimal places
  }).format(amount);
};

/**
 * Format a date to a human-readable string
 * 
 * Converts Date objects or date strings into user-friendly formatted strings
 * with different levels of detail based on the format parameter.
 * Uses the browser's locale-aware date formatting.
 * 
 * @param {string|Date} date - Date to format (Date object or date string)
 * @param {string} [format='short'] - Format option:
 *   - 'short': numeric (e.g., "7/6/2025")
 *   - 'medium': abbreviated (e.g., "Jul 6, 2025")
 *   - 'long': full text (e.g., "Saturday, July 6, 2025")
 * @returns {string} - Formatted date string or "Invalid Date" if input is invalid
 * 
 * @example
 * formatDate('2025-07-06')           // Returns "7/6/2025"
 * formatDate('2025-07-06', 'medium') // Returns "Jul 6, 2025"
 * formatDate('2025-07-06', 'long')   // Returns "Saturday, July 6, 2025"
 * formatDate('invalid')              // Returns "Invalid Date" (safe error handling)
 */
export const formatDate = (date, format = 'short') => {
  // Safety check for null/undefined dates
  if (!date) {
    return 'Invalid Date';
  }
  
  try {
    // Convert string dates to Date objects if needed
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Validate that we have a proper date (getTime() returns NaN for invalid dates)
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Define formatting options for different detail levels
    const options = {
      short: { month: 'numeric', day: 'numeric', year: 'numeric' },      // 7/6/2025
      medium: { month: 'short', day: 'numeric', year: 'numeric' },       // Jul 6, 2025
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, // Saturday, July 6, 2025
    };
    
    // Format the date using browser's Intl API with specified options
    // Fallback to short format if requested format is not defined
    return dateObj.toLocaleDateString('en-US', options[format] || options.short);
  } catch (error) {
    // Log any unexpected errors and return safe default
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Group an array of objects by a key
 * @param {Array} array - The array to group
 * @param {string|Function} key - The key to group by or a function that returns the key
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  // Handle invalid inputs
  if (!Array.isArray(array) || !key) {
    return {};
  }
  
  return array.reduce((result, item) => {
    // Handle null or undefined items
    if (!item) return result;
    
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    // Handle undefined keys
    if (groupKey === undefined || groupKey === null) return result;
    
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

/**
 * Get month name from month number (0-indexed)
 * @param {number} month - Month number (0-11)
 * @param {string} [format='long'] - Format: 'long' or 'short'
 * @returns {string} - Month name
 */
export const getMonthName = (month, format = 'long') => {
  // Handle invalid month numbers
  if (typeof month !== 'number' || month < 0 || month > 11) {
    month = 0; // Default to January
  }
  
  const date = new Date();
  date.setMonth(month);
  return date.toLocaleString('default', { month: format });
};

/**
 * Get current month and year
 * @returns {Object} - Object with month and year
 */
export const getCurrentMonthYear = () => {
  const date = new Date();
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  };
};

/**
 * Calculate the percentage of a value relative to a total
 * @param {number} value - The value
 * @param {number} total - The total
 * @returns {number} - The percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  // Handle invalid inputs
  if (typeof value !== 'number' || typeof total !== 'number' || !total) {
    return 0;
  }
  
  return Math.round((value / total) * 100);
};
