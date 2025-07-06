import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { budgetAPI } from '../api/api';

// Initial state
const initialState = {
  budgets: [],
  loading: false,
  error: null,
};

// Actions
export const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
};

// Reducer
const budgetReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, budgets: action.payload, loading: false };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.ADD_BUDGET:
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      };
    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        ),
      };
    case ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(
          (budget) => budget._id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Context
const BudgetContext = createContext();

// Provider component
export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load budgets when the provider mounts
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        dispatch({ type: ACTIONS.FETCH_START });
        console.log('🔍 Fetching budgets...');
        const budgets = await budgetAPI.getAll();
        console.log('✅ Budgets fetched:', budgets);
        
        // Ensure we always provide an array
        const safeBudgets = Array.isArray(budgets) ? budgets : [];
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: safeBudgets });
        
        if (!Array.isArray(budgets)) {
          console.warn('⚠️ Budgets API did not return an array:', budgets);
        }
      } catch (error) {
        console.error('❌ Error fetching budgets:', error);
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
        // Provide empty array on error
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: [] });
      }
    };

    loadBudgets();
  }, []);

  // Actions
  const addBudget = async (budget) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const newBudget = await budgetAPI.create(budget);
      dispatch({ type: ACTIONS.ADD_BUDGET, payload: newBudget });
      return newBudget;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateBudget = async (id, budget) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const updatedBudget = await budgetAPI.update(id, budget);
      dispatch({ type: ACTIONS.UPDATE_BUDGET, payload: updatedBudget });
      return updatedBudget;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      await budgetAPI.delete(id);
      dispatch({ type: ACTIONS.DELETE_BUDGET, payload: id });
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const value = {
    budgets: state.budgets,
    loading: state.loading,
    error: state.error,
    addBudget,
    updateBudget,
    deleteBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook
export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};
