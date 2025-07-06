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
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-8">
        <PageHeader title="Financial Dashboard" description="Overview of your personal finances" className="mb-0 pb-0 border-0" />
        <div className="text-sm text-muted-light dark:text-muted-dark">
          Last updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <SummaryCard 
          title="Total Balance" 
          value={totalIncome - totalExpenses}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>}
          changeType={totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}
          change={10}
          changeText="vs last month"
          loading={isLoading || transactionsLoading}
          highlight={true}
        />
        <SummaryCard 
          title="Total Income" 
          value={totalIncome}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
          </svg>}
          changeType="positive"
          change={5}
          changeText="vs last month"
          loading={isLoading || transactionsLoading}
        />
        <SummaryCard 
          title="Total Expenses" 
          value={totalExpenses}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>}
          changeType="negative"
          change={8}
          changeText="vs last month"
          loading={isLoading || transactionsLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="spinner"></div>
              </div>
            ) : monthlyData.length > 0 ? (
              <MonthlyExpensesChart data={monthlyData} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-light dark:text-muted-dark">No monthly data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="spinner"></div>
              </div>
            ) : categoryTotals.length > 0 ? (
              <CategoryPieChart data={categoryTotals} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-light dark:text-muted-dark">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card className="shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <RecentTransactionCard 
              transactions={recentTransactions} 
              loading={isLoading || transactionsLoading} 
            />
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CategoryBreakdownCard 
              categories={categoryTotals} 
              loading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
