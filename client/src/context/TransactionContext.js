import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { transactionAPI } from '../api/api';

// Initial state
const initialState = {
  transactions: [],
  loading: false,
  error: null,
};

// Actions
export const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
};

// Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, transactions: action.payload, loading: false };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
      };
    case ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction._id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Context
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
      const newTransaction = await transactionAPI.create(transaction);
      dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: newTransaction });
      return newTransaction;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
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
