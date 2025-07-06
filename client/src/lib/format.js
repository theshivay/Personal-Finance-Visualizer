/**
 * Format a number as a currency string
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  // Handle invalid inputs
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {string} [format='short'] - Format option: 'short', 'medium', 'long'
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  // Handle invalid date inputs
  if (!date) {
    return 'Invalid Date';
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const options = {
      short: { month: 'numeric', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };
    
    return dateObj.toLocaleDateString('en-US', options[format] || options.short);
  } catch (error) {
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
