/**
 * Analytics routes
 * Provides aggregated financial data for visualization and insights
 */

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

/**
 * @route   GET /api/analytics/monthly-summary
 * @desc    Get monthly expense/income summary for bar chart (Stage 1)
 * @access  Public
 */
router.get('/monthly-summary', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Create aggregation pipeline for monthly data
    const monthlySummary = await Transaction.aggregate([
      {
        // Filter by year
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        // Group by month and transaction type
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        // Reshape for easier client-side consumption
        $group: {
          _id: "$_id.month",
          month: { $first: "$_id.month" },
          data: { 
            $push: { 
              type: "$_id.type",
              amount: "$total"
            }
          }
        }
      },
      {
        // Sort by month
        $sort: { "_id": 1 }
      },
      {
        // Project final shape
        $project: {
          _id: 0,
          month: 1,
          data: 1
        }
      }
    ]);
    
    // Fill in missing months with zero values
    const fullYearData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = monthlySummary.find(m => m.month === month);
      
      if (monthData) {
        // Ensure both expense and income are present
        const hasExpense = monthData.data.some(d => d.type === 'expense');
        const hasIncome = monthData.data.some(d => d.type === 'income');
        
        if (!hasExpense) {
          monthData.data.push({ type: 'expense', amount: 0 });
        }
        if (!hasIncome) {
          monthData.data.push({ type: 'income', amount: 0 });
        }
        
        fullYearData.push(monthData);
      } else {
        // Add month with zero values
        fullYearData.push({
          month,
          data: [
            { type: 'expense', amount: 0 },
            { type: 'income', amount: 0 }
          ]
        });
      }
    }
    
    res.json(fullYearData);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/analytics/category-summary
 * @desc    Get category-wise expense summary for pie chart (Stage 2)
 * @access  Public
 */
router.get('/category-summary', async (req, res) => {
  try {
    const { 
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
      endDate = new Date(),
      type = 'expense'
    } = req.query;
    
    // Create date objects from string parameters
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const categorySummary = await Transaction.aggregate([
      {
        // Filter by date range and transaction type
        $match: {
          date: { $gte: start, $lte: end },
          type
        }
      },
      {
        // Join with categories collection
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        // Unwind category array from lookup
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        // Group by category
        $group: {
          _id: '$category',
          categoryName: { $first: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] } },
          categoryColor: { $first: { $ifNull: ['$categoryInfo.color', '#6E7582'] } },
          total: { $sum: '$amount' }
        }
      },
      {
        // Sort by total amount
        $sort: { total: -1 }
      },
      {
        // Project final shape
        $project: {
          _id: 0,
          id: { $ifNull: ['$_id', 'uncategorized'] },
          name: '$categoryName',
          color: '$categoryColor',
          value: '$total'
        }
      }
    ]);
    
    res.json(categorySummary);
  } catch (error) {
    console.error('Error fetching category summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/analytics/monthly-expenses
 * @desc    Get monthly expense data for line/bar chart (used in Dashboard)
 * @access  Public
 */
router.get('/monthly-expenses', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Create aggregation pipeline for monthly expense data
    const monthlyExpenses = await Transaction.aggregate([
      {
        // Filter by year and negative amounts (expenses)
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          },
          amount: { $lt: 0 }
        }
      },
      {
        // Group by month
        $group: {
          _id: { $month: "$date" },
          month: { $first: { $month: "$date" } },
          total: { $sum: { $abs: "$amount" } } // Convert to positive for chart display
        }
      },
      {
        // Sort by month
        $sort: { "_id": 1 }
      },
      {
        // Project final shape
        $project: {
          _id: 0,
          month: 1,
          amount: "$total"
        }
      }
    ]);
    
    // Fill in missing months with zero values
    const fullYearData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 1; month <= 12; month++) {
      const monthData = monthlyExpenses.find(m => m.month === month);
      
      if (monthData) {
        fullYearData.push({
          ...monthData,
          name: monthNames[month-1] // Add month name for chart labels
        });
      } else {
        // Add month with zero value
        fullYearData.push({
          month,
          name: monthNames[month-1],
          amount: 0
        });
      }
    }
    
    res.json(fullYearData);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/analytics/dashboard-summary
 * @desc    Get summary data for dashboard (Stage 2)
 * @access  Public
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    // Get current month date range
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get previous month date range
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Get total income/expense for current month
    const currentMonthSummary = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get total income/expense for previous month
    const prevMonthSummary = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: prevMonthStart, $lte: prevMonthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get top 3 spending categories for current month
    const topCategories = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] } },
          categoryColor: { $first: { $ifNull: ['$categoryInfo.color', '#6E7582'] } },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          id: { $ifNull: ['$_id', 'uncategorized'] },
          name: '$categoryName',
          color: '$categoryColor',
          amount: '$total'
        }
      }
    ]);
    
    // Get 5 most recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('categoryId', 'name color icon');
    
    // Format the summary data
    const currentMonthIncome = currentMonthSummary.find(s => s._id === 'income')?.total || 0;
    const currentMonthExpense = currentMonthSummary.find(s => s._id === 'expense')?.total || 0;
    const prevMonthIncome = prevMonthSummary.find(s => s._id === 'income')?.total || 0;
    const prevMonthExpense = prevMonthSummary.find(s => s._id === 'expense')?.total || 0;
    
    // Calculate month-over-month change percentages
    const incomeChange = prevMonthIncome === 0 
      ? 100 
      : ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100;
    const expenseChange = prevMonthExpense === 0 
      ? 100 
      : ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;
    
    res.json({
      currentMonth: {
        income: currentMonthIncome,
        expense: currentMonthExpense,
        balance: currentMonthIncome - currentMonthExpense
      },
      previousMonth: {
        income: prevMonthIncome,
        expense: prevMonthExpense,
        balance: prevMonthIncome - prevMonthExpense
      },
      changes: {
        income: incomeChange.toFixed(2),
        expense: expenseChange.toFixed(2)
      },
      topCategories,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/analytics/budget-comparison
 * @desc    Get budget vs actual comparison (Stage 3)
 * @access  Public
 */
router.get('/budget-comparison', async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get all budgets for the month/year
    const budgets = await Budget.find({
      month: parseInt(month),
      year: parseInt(year)
    }).populate('categoryId', 'name color icon');
    
    // Get all expense transactions for the month grouped by category
    const actualExpenses = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          actual: { $sum: '$amount' }
        }
      }
    ]);
    
    // Create comparison data
    const comparison = budgets.map(budget => {
      // Find actual expense for this budget's category
      const expense = actualExpenses.find(e => 
        e._id && budget.categoryId._id.equals(e._id)
      );
      
      // Calculate actual amount (default to 0 if no transactions found)
      const actualAmount = expense ? expense.actual : 0;
      
      // Calculate difference and percentage
      const difference = budget.amount - actualAmount;
      const percentage = budget.amount > 0 
        ? (actualAmount / budget.amount) * 100 
        : 0;
      
      return {
        id: budget._id,
        category: {
          id: budget.categoryId._id,
          name: budget.categoryId.name,
          color: budget.categoryId.color,
          icon: budget.categoryId.icon
        },
        budgeted: budget.amount,
        actual: actualAmount,
        difference,
        percentage: Math.min(percentage, 100), // Cap at 100%
        status: difference >= 0 ? 'within' : 'exceeded'
      };
    });
    
    // Add categories with expenses but no budget
    const categoriesWithoutBudget = actualExpenses
      .filter(expense => expense._id && // Filter out null categories
        !budgets.some(budget => 
          budget.categoryId._id.equals(expense._id)
        )
      );
    
    // If we have categories with expenses but no budget, fetch their details
    if (categoriesWithoutBudget.length > 0) {
      // Get category details
      const categoryIds = categoriesWithoutBudget.map(e => e._id);
      
      const categories = await mongoose.model('Category').find({
        _id: { $in: categoryIds }
      });
      
      // Add to comparison data
      categoriesWithoutBudget.forEach(expense => {
        const category = categories.find(c => c._id.equals(expense._id));
        
        if (category) {
          comparison.push({
            id: `unbudgeted-${category._id}`,
            category: {
              id: category._id,
              name: category.name,
              color: category.color,
              icon: category.icon
            },
            budgeted: 0,
            actual: expense.actual,
            difference: -expense.actual,
            percentage: 100, // Always 100% as there's no budget
            status: 'unbudgeted'
          });
        }
      });
    }
    
    // Sort by percentage (highest first)
    comparison.sort((a, b) => b.percentage - a.percentage);
    
    res.json(comparison);
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/analytics/insights
 * @desc    Get spending insights (Stage 3)
 * @access  Public
 */
router.get('/insights', async (req, res) => {
  try {
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Set up date ranges
    const thisMonthStart = new Date(currentYear, currentMonth, 1);
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);
    
    // Get current month's spending so far
    const currentMonthSpending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: thisMonthStart, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get last month's total spending
    const lastMonthSpending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get highest spending day of the current month
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: thisMonthStart, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    // Get category with the most significant increase
    const currentMonthCategorySpending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: thisMonthStart, $lte: now }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] } },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const lastMonthCategorySpending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] } },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Calculate category spending differences
    const categoryChanges = [];
    
    currentMonthCategorySpending.forEach(current => {
      const lastMonth = lastMonthCategorySpending.find(last => 
        (current._id && last._id && current._id.equals(last._id)) ||
        (current._id === null && last._id === null)
      );
      
      const lastMonthTotal = lastMonth ? lastMonth.total : 0;
      const change = lastMonthTotal === 0 
        ? 100 
        : ((current.total - lastMonthTotal) / lastMonthTotal) * 100;
      
      if (current.total > 0) {
        categoryChanges.push({
          categoryId: current._id,
          name: current.categoryName,
          currentAmount: current.total,
          previousAmount: lastMonthTotal,
          change
        });
      }
    });
    
    // Also check for categories that had spending last month but not this month
    lastMonthCategorySpending.forEach(last => {
      const hasCurrent = currentMonthCategorySpending.some(current => 
        (current._id && last._id && current._id.equals(last._id)) ||
        (current._id === null && last._id === null)
      );
      
      if (!hasCurrent && last.total > 0) {
        categoryChanges.push({
          categoryId: last._id,
          name: last.categoryName,
          currentAmount: 0,
          previousAmount: last.total,
          change: -100
        });
      }
    });
    
    // Sort by absolute change value (largest first)
    categoryChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    
    // Get day of month
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Calculate projected spending based on daily average
    const currentTotal = currentMonthSpending[0]?.total || 0;
    const dailyAverage = currentTotal / dayOfMonth;
    const projectedTotal = dailyAverage * daysInMonth;
    
    // Calculate last month's daily average
    const lastMonthTotal = lastMonthSpending[0]?.total || 0;
    const lastMonthDailyAverage = lastMonthTotal / lastMonthEnd.getDate();
    
    // Format insights
    const insights = {
      currentMonthToDate: {
        total: currentTotal,
        dailyAverage: dailyAverage.toFixed(2),
        transactionCount: currentMonthSpending[0]?.count || 0
      },
      lastMonth: {
        total: lastMonthTotal,
        dailyAverage: lastMonthDailyAverage.toFixed(2),
        transactionCount: lastMonthSpending[0]?.count || 0
      },
      projectedSpending: {
        total: projectedTotal.toFixed(2),
        percentageChange: lastMonthTotal > 0 
          ? (((projectedTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2) 
          : '0.00'
      },
      highestSpendingDay: dailySpending.length > 0 
        ? {
          date: dailySpending[0]._id,
          amount: dailySpending[0].total,
          transactions: dailySpending[0].count
        }
        : null,
      significantChanges: categoryChanges.slice(0, 3).map(c => ({
        category: c.name,
        currentAmount: c.currentAmount,
        previousAmount: c.previousAmount,
        percentageChange: c.change.toFixed(2),
        increasing: c.change > 0
      }))
    };
    
    res.json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
