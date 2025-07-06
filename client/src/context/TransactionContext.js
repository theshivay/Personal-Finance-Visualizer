/**
 * Transaction Context Module
 * 
 * This module provides a global state management system for transactions using React Context API.
 * It implements:
 * - Centralized state for transactions across components
 * - Actions for CRUD operations
 * - Loading and error states
 * - Integration with the transaction API service
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { transactionAPI } from '../api/api';

/**
 * Initial state for the transaction context
 * Contains empty transactions array and default loading/error states
 */
const initialState = {
  transactions: [],  // List of all transactions
  loading: false,    // Loading state indicator
  error: null,       // Error state
};

/**
 * Action type constants
 * These define all possible actions that can be dispatched to the reducer
 * Using constants prevents typos and makes debugging easier
 */
export const ACTIONS = {
  FETCH_START: 'FETCH_START',           // Indicates data fetching has begun
  FETCH_SUCCESS: 'FETCH_SUCCESS',       // Data fetching completed successfully
  FETCH_ERROR: 'FETCH_ERROR',           // Error occurred during data fetching
  ADD_TRANSACTION: 'ADD_TRANSACTION',   // Add a new transaction to state
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION', // Update existing transaction
  DELETE_TRANSACTION: 'DELETE_TRANSACTION', // Remove a transaction
};

/**
 * Transaction Reducer
 * 
 * Pure function that handles state updates based on dispatched actions
 * Each case represents a specific state transition
 * 
 * @param {Object} state - Current state object
 * @param {Object} action - Action with type and optional payload
 * @returns {Object} New state
 */
const transactionReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      // Set loading state and clear any previous errors
      return { ...state, loading: true, error: null };
    
    case ACTIONS.FETCH_SUCCESS:
      // Update transactions with fetched data and turn off loading state
      return { ...state, transactions: action.payload, loading: false };
    
    case ACTIONS.FETCH_ERROR:
      // Store error and turn off loading state
      return { ...state, loading: false, error: action.payload };
    
    case ACTIONS.ADD_TRANSACTION:
      // Add the new transaction to the existing array
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    
    case ACTIONS.UPDATE_TRANSACTION:
      // Replace the updated transaction while keeping others unchanged
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
      };
    
    case ACTIONS.DELETE_TRANSACTION:
      // Remove the specified transaction from the array
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction._id !== action.payload
        ),
      };
    
    default:
      // Unknown action types don't modify state
      return state;
  }
};

/**
 * Create React Context
 * This creates the actual context object that will be used for Provider and Consumer
 */
const TransactionContext = createContext();

// Provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Load transactions when the provider mounts
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        dispatch({ type: ACTIONS.FETCH_START });
        console.log('🔍 Fetching transactions...');
        const transactions = await transactionAPI.getAll();
        console.log('✅ Transactions fetched:', transactions);
        
        // Ensure we always provide an array
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: safeTransactions });
        
        if (!Array.isArray(transactions)) {
          console.warn('⚠️ Transactions API did not return an array:', transactions);
        }
      } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
        // Provide empty array on error
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: [] });
      }
    };

    loadTransactions();
  }, []);

  // Actions
  const addTransaction = async (transaction) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      console.log('Creating transaction:', transaction);
      const newTransaction = await transactionAPI.create(transaction);
      console.log('Transaction created successfully:', newTransaction);
      dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: newTransaction });
      return newTransaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message || 'Failed to create transaction' });
      throw error;
    }
  };

  const updateTransaction = async (id, transaction) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const updatedTransaction = await transactionAPI.update(id, transaction);
      dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: updatedTransaction });
      return updatedTransaction;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      await transactionAPI.delete(id);
      dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id });
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const value = {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
