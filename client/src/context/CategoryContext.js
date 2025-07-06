import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { categoryAPI } from '../api/api';

// Initial state
const initialState = {
  categories: [],
  loading: false,
  error: null,
};

// Actions
export const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
};

// Reducer
const categoryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, categories: action.payload, loading: false };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case ACTIONS.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        ),
      };
    case ACTIONS.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category._id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Context
const CategoryContext = createContext();

// Provider component
export const CategoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  // Load categories when the provider mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        dispatch({ type: ACTIONS.FETCH_START });
        console.log('🔍 Fetching categories...');
        const categories = await categoryAPI.getAll();
        console.log('✅ Categories fetched:', categories);
        
        // Ensure we always provide an array
        const safeCategories = Array.isArray(categories) ? categories : [];
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: safeCategories });
        
        if (!Array.isArray(categories)) {
          console.warn('⚠️ Categories API did not return an array:', categories);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
        // Provide empty array on error
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: [] });
      }
    };

    loadCategories();
  }, []);

  // Actions
  const addCategory = async (category) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const newCategory = await categoryAPI.create(category);
      dispatch({ type: ACTIONS.ADD_CATEGORY, payload: newCategory });
      return newCategory;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateCategory = async (id, category) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const updatedCategory = await categoryAPI.update(id, category);
      dispatch({ type: ACTIONS.UPDATE_CATEGORY, payload: updatedCategory });
      return updatedCategory;
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      await categoryAPI.delete(id);
      dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: id });
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  };

  const value = {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
