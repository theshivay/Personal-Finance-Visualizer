import React, { useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout/layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { MonthlyExpensesChart } from '../components/charts/MonthlyExpensesChart';
import { useTransactions } from '../context/TransactionContext';
import { analyticsAPI } from '../api/api';
import { useEffect } from 'react';

const Transactions = () => {
  const { transactions, deleteTransaction, loading: transactionsLoading } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Fetch monthly data for the chart
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const data = await analyticsAPI.getMonthlyExpenses(currentYear);
        setMonthlyData(data);
      } catch (error) {
        console.error('Error fetching monthly expenses:', error);
      }
    };
    
    fetchMonthlyData();
  }, [transactions]);
  
  // Ensure transactions is an array before filtering
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Filter transactions based on search term
  const filteredTransactions = safeTransactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  
  const handleOpenForm = () => {
    setCurrentTransaction(null);
    setIsFormOpen(true);
  };
  
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };
  
  const handleFormSave = () => {
    setIsFormOpen(false);
    setCurrentTransaction(null);
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentTransaction(null);
  };
  
  return (
    <PageContainer>
      <PageHeader title="Transactions" description="Manage your income and expenses" />
      
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Monthly Expenses</h3>
            {monthlyData.length > 0 ? (
              <MonthlyExpensesChart data={monthlyData} />
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted">No monthly data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenForm}>Add Transaction</Button>
      </div>
      
      {transactionsLoading && (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p>Loading transactions...</p>
          </CardContent>
        </Card>
      )}
      
      {isFormOpen ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {currentTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h3>
            <TransactionForm
              transaction={currentTransaction}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      ) : null}
      
      {!transactionsLoading && (
        sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          <TransactionList
            transactions={sortedTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )
      )}
    </PageContainer>
  );
};

export default Transactions;
