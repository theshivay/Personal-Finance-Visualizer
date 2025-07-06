import React, { useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout/layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { CategoryList } from '../components/categories/CategoryList';
import { CategoryForm } from '../components/categories/CategoryForm';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';

const Categories = () => {
  const { categories, deleteCategory } = useCategories();
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Ensure categories is an array before filtering
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Filter categories based on search term
  const filteredCategories = safeCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Ensure transactions is an array before filtering
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Add debug logs to check data
  console.log('🔍 Categories Debug:');
  console.log('- Categories:', safeCategories);
  console.log('- Transactions:', safeTransactions);
  
  // Calculate category totals for pie chart
  const categoryData = safeCategories.map(category => {
    const categoryId = category._id;
    
    // Handle both cases: when categoryId is a string or when it's an object with _id
    const total = safeTransactions
      .filter(t => {
        // Handle cases where categoryId could be an object with _id or a string
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
  }).filter(cat => cat.amount > 0);
  
  const handleOpenForm = () => {
    setCurrentCategory(null);
    setIsFormOpen(true);
  };
  
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setIsFormOpen(true);
  };
  
  const handleDeleteCategory = async (id) => {
    // Check if the category has transactions
    const hasTransactions = safeTransactions.some(t => {
      const transactionCategoryId = typeof t.categoryId === 'object' && t.categoryId !== null
        ? t.categoryId._id
        : t.categoryId;
      
      return transactionCategoryId === id;
    });
    
    if (hasTransactions) {
      alert('This category has transactions. Please reassign them before deleting.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };
  
  const handleFormSave = () => {
    setIsFormOpen(false);
    setCurrentCategory(null);
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentCategory(null);
  };
  
  return (
    <PageContainer>
      <PageHeader title="Categories" description="Manage your transaction categories" />
      
      <div className="mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <div className="w-full flex justify-center">
                <div className="w-full max-w-[400px]">
                  <CategoryPieChart data={categoryData} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenForm}>Add Category</Button>
      </div>
      
      {isFormOpen ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {currentCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <CategoryForm
              category={currentCategory}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      ) : null}
      
      <CategoryList
        categories={filteredCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />
    </PageContainer>
  );
};

export default Categories;
