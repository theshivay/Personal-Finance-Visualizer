import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SummaryCard, RecentTransactionCard, CategoryBreakdownCard } from '../components/dashboard/SummaryCards';
import { MonthlyExpensesChart } from '../components/charts/MonthlyExpensesChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { analyticsAPI } from '../api/api';

const Dashboard = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories } = useCategories();
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const currentYear = new Date().getFullYear();
        
        // Get monthly expenses data
        const monthlyExpenses = await analyticsAPI.getMonthlyExpenses(currentYear);
        setMonthlyData(Array.isArray(monthlyExpenses) ? monthlyExpenses : []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Ensure transactions and categories are arrays
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Calculate total expenses (negative amounts)
  const totalExpenses = safeTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate total income (positive amounts)
  const totalIncome = safeTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get recent transactions (last 5)
  const recentTransactions = [...safeTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  // Debug logs to check data
  console.log('🧪 Dashboard Debug:');
  console.log('- Categories:', safeCategories);
  console.log('- Transactions:', safeTransactions);
  console.log('- Monthly Data:', monthlyData);

  // Calculate category totals for pie chart
  const categoryTotals = safeCategories.length > 0 && safeTransactions.length > 0
    ? safeCategories.map(category => {
        const categoryId = category._id;
        
        const total = safeTransactions
          .filter(t => {
            // Check if categoryId is an object or a string ID
            const transactionCategoryId = typeof t.categoryId === 'object' && t.categoryId !== null
              ? t.categoryId._id
              : t.categoryId;
              
            return transactionCategoryId === categoryId && t.amount < 0;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
          name: category.name,
          amount: total,
        };
      }).filter(cat => cat.amount > 0)
    : [];
  
  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Overview of your finances" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard 
          title="Total Balance" 
          value={totalIncome - totalExpenses} 
          type="balance"
          loading={isLoading || transactionsLoading}
        />
        <SummaryCard 
          title="Income" 
          value={totalIncome} 
          type="income"
          loading={isLoading || transactionsLoading}
        />
        <SummaryCard 
          title="Expenses" 
          value={totalExpenses} 
          type="expense"
          loading={isLoading || transactionsLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p>Loading chart data...</p>
              </div>
            ) : monthlyData.length > 0 ? (
              <MonthlyExpensesChart data={monthlyData} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted">No monthly data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p>Loading chart data...</p>
              </div>
            ) : categoryTotals.length > 0 ? (
              <CategoryPieChart data={categoryTotals} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTransactionCard 
          transactions={recentTransactions} 
          loading={isLoading || transactionsLoading} 
        />
        <CategoryBreakdownCard 
          categories={categoryTotals} 
          loading={isLoading} 
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
