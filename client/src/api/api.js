import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('API_URL:', API_URL); // Debug API_URL

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
    };
    return Promise.reject(customError);
  }
);

// Transaction API calls
export const transactionAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/transactions');
      // Handle both direct array and {transactions: [...]} format
      const transactions = response.data.transactions || response.data;
      return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      return null;
    }
  },
  create: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },
  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },
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
