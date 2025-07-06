import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '../components/layout/layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { BudgetList } from '../components/budgets/BudgetList';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { BudgetComparisonChart } from '../components/charts/BudgetComparisonChart';
import { useBudgets } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';
import { analyticsAPI } from '../api/api';
import { getCurrentMonthYear } from '../lib/format';

const Budgets = () => {
  const { budgets, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBudget, setCurrentBudget] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentDate = getCurrentMonthYear();
  
  useEffect(() => {
    const fetchBudgetComparison = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching budget comparison for month:', currentDate.month + 1, 'year:', currentDate.year);
        
        const data = await analyticsAPI.getBudgetComparison(
          currentDate.month + 1,
          currentDate.year
        );
        
        console.log('Raw budget comparison data:', data);
        
        // Transform the data to match what BudgetComparisonChart expects
        const transformedData = Array.isArray(data) ? data.map(item => ({
          category: item.category?.name || 'Uncategorized',
          categoryColor: item.category?.color || '#6B7280',
          budgetAmount: typeof item.budgeted === 'number' ? item.budgeted : 0,
          actualExpenses: typeof item.actual === 'number' ? Math.abs(item.actual) : 0,
          percentage: item.percentage || 0,
          difference: item.difference || 0,
          status: item.status || (
            (item.budgeted || 0) >= Math.abs(item.actual || 0) ? 'within' : 'exceeded'
          )
        })) : [];
        
        console.log('Transformed budget comparison data:', transformedData);
        setComparisonData(transformedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching budget comparison data:', error);
        setIsLoading(false);
        setComparisonData([]);
      }
    };
    
    fetchBudgetComparison();
  }, [budgets, transactions, currentDate.month, currentDate.year]);
  
  // Ensure budgets, categories and transactions are arrays
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Helper function to normalize categoryId (handles both object and string)
  const getCategoryId = (categoryId) => {
    return typeof categoryId === 'object' && categoryId !== null
      ? categoryId._id
      : categoryId;
  };

  // Filter budgets based on search term and calculate spent amounts
  const filteredBudgets = safeBudgets.filter(budget => {
    const budgetCategoryId = getCategoryId(budget.categoryId);
    const category = safeCategories.find(c => c._id === budgetCategoryId);
    return category && category.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).map(budget => {
    // Calculate amount spent for this budget's category in the same month/year
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0);
    
    const budgetCategoryId = getCategoryId(budget.categoryId);
    
    const spent = safeTransactions
      .filter(t => {
        const transactionCategoryId = getCategoryId(t.categoryId);
        return (
          transactionCategoryId === budgetCategoryId &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate &&
          t.amount < 0
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      ...budget,
      spent,
    };
  });
  
  // Sort budgets by year and month (newest first)
  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  const handleOpenForm = () => {
    setCurrentBudget(null);
    setIsFormOpen(true);
  };
  
  const handleEditBudget = (budget) => {
    setCurrentBudget(budget);
    setIsFormOpen(true);
  };
  
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };
  
  const handleFormSave = () => {
    setIsFormOpen(false);
    setCurrentBudget(null);
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentBudget(null);
  };
  
  return (
    <PageContainer>
      <PageHeader title="Budgets" description="Set and track your spending limits" />
      
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Budget vs. Actual Spending</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <p>Loading budget data...</p>
              </div>
            ) : comparisonData.length > 0 ? (
              <BudgetComparisonChart data={comparisonData} />
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted">No budget comparison data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder="Search budgets by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenForm}>Add Budget</Button>
      </div>
      
      {isFormOpen ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {currentBudget ? 'Edit Budget' : 'New Budget'}
            </h3>
            <BudgetForm
              budget={currentBudget}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      ) : null}
      
      <BudgetList
        budgets={sortedBudgets}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
      />
    </PageContainer>
  );
};

export default Budgets;
