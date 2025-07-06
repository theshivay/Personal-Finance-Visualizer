/**
 * API Service Module
 * 
 * This module provides a centralized API client for all server communications.
 * It handles:
 * - Base URL configuration
 * - Default headers
 * - Error handling
 * - Structured API calls for different data types (transactions, categories, budgets)
 */

import axios from 'axios';

// Configure API base URL from environment variables or use default
// This allows changing the API URL without code changes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Log the API URL during development to verify configuration
console.log('API_URL:', API_URL); 

/**
 * Create an axios instance with default configuration
 * This provides consistent settings across all API calls
 */
export const api = axios.create({
  baseURL: API_URL,      // Base URL for all requests
  headers: {
    'Content-Type': 'application/json',  // Default content type
  },
});

/**
 * Response interceptor for global error handling
 * 
 * This intercepts all API responses and provides:
 * 1. Standard error formatting
 * 2. Consistent error handling across the app
 * 3. Fallback error messages when server response is incomplete
 */
api.interceptors.response.use(
  // Success path - just pass through the response
  (response) => response,
  
  // Error handling path - format errors consistently
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', error.response || error);
    
    // Extract useful error information
    let errorMessage = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      // Handle validation errors array from express-validator
      errorMessage = error.response.data.errors.map(err => err.msg).join(', ');
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create a standardized error object
    const customError = {
      message: errorMessage,
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };
    return Promise.reject(customError);
  }
);

/**
 * Transaction API Service
 * 
 * Provides methods for all transaction-related API operations
 * Each method handles a specific CRUD operation and includes error handling
 */
export const transactionAPI = {
  /**
   * Fetch all transactions
   * @returns {Array} List of transactions or empty array if error occurs
   */
  getAll: async () => {
    try {
      const response = await api.get('/transactions');
      // Handle both API response formats:
      // 1. Direct array of transactions
      // 2. Object with transactions property containing the array
      const transactions = response.data.transactions || response.data;
      
      // Ensure we always return an array even if API returns unexpected format
      return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return []; // Return empty array on error for safe UI rendering
    }
  },
  
  /**
   * Fetch a single transaction by ID
   * @param {string} id - Transaction ID to retrieve
   * @returns {Object|null} Transaction object or null if not found
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      return null; // Return null on error
    }
  },
  
  /**
   * Create a new transaction
   * @param {Object} transaction - Transaction data to create
   * @returns {Object} Created transaction with ID
   * @throws Will throw an error if creation fails
   */
  create: async (transaction) => {
    console.log('API: Creating transaction with data:', transaction);
    try {
      const response = await api.post('/transactions', transaction);
      console.log('API: Transaction created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error creating transaction:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing transaction
   * @param {string} id - ID of transaction to update
   * @param {Object} transaction - New transaction data
   * @returns {Object} Updated transaction
   * @throws Will throw an error if update fails
   */
  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },
  
  /**
   * Delete a transaction
   * @param {string} id - ID of transaction to delete
   * @returns {Object} Response data from API
   * @throws Will throw an error if deletion fails
   */
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

// Category API calls
export const categoryAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },
  create: async (category) => {
    const response = await api.post('/categories', category);
    return response.data;
  },
  update: async (id, category) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Budget API calls
export const budgetAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/budgets');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/budgets/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error);
      return null;
    }
  },
  create: async (budget) => {
    const response = await api.post('/budgets', budget);
    return response.data;
  },
  update: async (id, budget) => {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

// Analytics API calls
export const analyticsAPI = {
  getMonthlyExpenses: async (year) => {
    console.log('Fetching monthly expenses for year:', year);
    const url = `/analytics/monthly-expenses?year=${year}`;
    console.log('Full URL:', API_URL + url);
    try {
      const response = await api.get(url);
      console.log('Monthly expenses response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
      return [];
    }
  },
  getCategoryBreakdown: async (startDate, endDate) => {
    try {
      const response = await api.get(`/analytics/category-breakdown?startDate=${startDate}&endDate=${endDate}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      return [];
    }
  },
  getBudgetComparison: async (month, year) => {
    try {
      console.log(`Fetching budget comparison for month: ${month}, year: ${year}`);
      const response = await api.get(`/analytics/budget-comparison?month=${month}&year=${year}`);
      
      // Check response structure
      if (!response.data) {
        console.error('Budget comparison response is empty or null');
        return [];
      }
      
      console.log('Budget comparison response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching budget comparison:', error);
      return [];
    }
  },
};
