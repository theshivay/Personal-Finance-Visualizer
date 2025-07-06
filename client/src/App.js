/**
 * Main Application Component
 * 
 * This is the root component of the Personal Finance Visualizer application.
 * It sets up:
 * 1. Client-side routing with React Router
 * 2. Global state providers for transactions, categories, and budgets
 * 3. Main layout structure
 * 4. Route definitions for all pages
 */

import React from 'react';
// React Router components for client-side navigation
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Main layout component that wraps all pages
import { Layout } from './components/layout/layout';
// Theme transition animation overlay
import ThemeTransitionOverlay from './components/ui/ThemeTransitionOverlay';
// Page components
import Dashboard from './pages/Dashboard';       // Main dashboard with overview
import Transactions from './pages/Transactions'; // Transaction management
import Categories from './pages/Categories';     // Category management
import Budgets from './pages/Budgets';           // Budget planning
// Context providers for global state management
import { TransactionProvider } from './context/TransactionContext';
import { CategoryProvider } from './context/CategoryContext';
import { BudgetProvider } from './context/BudgetContext';
// Global styles
import './App.css';

/**
 * App component - Application entry point
 * 
 * Sets up the component hierarchy and routing structure
 * 
 * Note the nested structure of providers:
 * - Router provides navigation context
 * - TransactionProvider, CategoryProvider, and BudgetProvider provide data contexts
 * - Layout provides the visual structure (header, sidebar, main content area)
 * - Routes define the mapping between URLs and page components
 * 
 * @returns {JSX.Element} The rendered application
 */
function App() {
  return (
    <Router>
      {/* Theme transition overlay for animation when toggling themes */}
      <ThemeTransitionOverlay />
      
      {/* Transaction provider - outermost data context */}
      <TransactionProvider>
        {/* Category provider - categories needed for transactions */}
        <CategoryProvider>
          {/* Budget provider - budgets depend on categories */}
          <BudgetProvider>
            {/* Layout component provides consistent page structure */}
            <Layout>
              {/* Route definitions map URLs to page components */}
              <Routes>
                {/* Dashboard - home page with overview */}
                <Route path="/" element={<Dashboard />} />
                {/* Transaction management page */}
                <Route path="/transactions" element={<Transactions />} />
                {/* Category management page */}
                <Route path="/categories" element={<Categories />} />
                {/* Budget planning and tracking page */}
                <Route path="/budgets" element={<Budgets />} />
                {/* Catch-all for undefined routes - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BudgetProvider>
        </CategoryProvider>
      </TransactionProvider>
    </Router>
  );
}

export default App;
