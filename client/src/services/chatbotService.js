/**
 * Service for handling chatbot API calls with AI integration
 */
import { processWithAI } from '../utils/aiHelper';

// Financial data - In production, this would be fetched from your API
const mockFinancialData = {
  transactions: [
    // Expense transactions
    { id: 1, amount: 45.50, type: "expense", merchant: "Grocery Store", category: "Groceries", date: "2025-07-04" },
    { id: 2, amount: 28.75, type: "expense", merchant: "Gas Station", category: "Transportation", date: "2025-07-03" },
    { id: 3, amount: 12.35, type: "expense", merchant: "Coffee Shop", category: "Dining Out", date: "2025-07-03" },
    { id: 4, amount: 89.99, type: "expense", merchant: "Internet Provider", category: "Utilities", date: "2025-07-01" },
    { id: 5, amount: 150.00, type: "expense", merchant: "Electricity Company", category: "Utilities", date: "2025-07-01" },
    { id: 6, amount: 35.20, type: "expense", merchant: "Restaurant", category: "Dining Out", date: "2025-06-30" },
    { id: 7, amount: 250.00, type: "expense", merchant: "Rent Payment", category: "Housing", date: "2025-06-28" },
    // Income transactions
    { id: 8, amount: 3200.00, type: "income", merchant: "Employer Inc.", category: "Salary", date: "2025-07-01" },
    { id: 9, amount: 350.00, type: "income", merchant: "Freelance Client", category: "Side Gig", date: "2025-07-03" },
    { id: 10, amount: 75.00, type: "income", merchant: "Stock Dividends", category: "Investments", date: "2025-06-29" },
  ],
  
  budgets: [
    { id: 1, category: "Groceries", limit: 400.00, spent: 320.75, period: "monthly" },
    { id: 2, category: "Dining Out", limit: 200.00, spent: 180.55, period: "monthly" },
    { id: 3, category: "Utilities", limit: 300.00, spent: 239.99, period: "monthly" },
    { id: 4, category: "Transportation", limit: 150.00, spent: 85.25, period: "monthly" },
    { id: 5, category: "Entertainment", limit: 100.00, spent: 45.99, period: "monthly" },
  ],
  
  categories: [
    { id: 1, name: "Groceries", color: "#4CAF50", icon: "shopping-cart" },
    { id: 2, name: "Dining Out", color: "#FF5722", icon: "utensils" },
    { id: 3, name: "Utilities", color: "#2196F3", icon: "bolt" },
    { id: 4, name: "Transportation", color: "#FFC107", icon: "car" },
    { id: 5, name: "Entertainment", color: "#9C27B0", icon: "film" },
    { id: 6, name: "Housing", color: "#3F51B5", icon: "home" },
  ],
  
  summary: {
    totalSpent: 1250.75,
    totalIncome: 3625.00,
    netCashflow: 2374.25, // Income minus expenses
    totalBudget: 1850.00,
    savingsGoal: 500.00,
    currentSavings: 340.25,
    lastMonthComparison: -15, // Percentage change compared to last month (negative means spending less)
    lastMonthIncomeComparison: 5, // Percentage change compared to last month's income
    topCategories: ["Groceries", "Utilities", "Dining Out"],
    incomeCategories: ["Salary", "Side Gig", "Investments"]
  }
};

class ChatbotService {
  constructor() {
    this.useAI = true; // Toggle to enable/disable AI processing
    this.mockMode = true; // Toggle between mock data and real API data
    this.financialData = null; // Will be populated by fetchFinancialData
  }

  /**
   * Fetch financial data from the API
   * In a real application, this would make API calls to your backend
   */
  async fetchFinancialData() {
    try {
      // If already fetched and using mock mode, return the cached data
      if (this.financialData && this.mockMode) {
        return this.financialData;
      }
      
      if (this.mockMode) {
        // For mock mode, return static data after a short delay
        await new Promise(resolve => setTimeout(resolve, 300));
        this.financialData = mockFinancialData;
        return this.financialData;
      } else {
        // In production, use actual API calls
        // Implementation for fetching real data from the backend
        try {
          const endpoints = [
            fetch('/api/transactions').then(res => res.json()),
            fetch('/api/budgets').then(res => res.json()),
            fetch('/api/categories').then(res => res.json()),
            fetch('/api/summary').then(res => res.json())
          ];
          
          const [transactions, budgets, categories, summary] = await Promise.all(endpoints);
          
          this.financialData = {
            transactions,
            budgets,
            categories,
            summary
          };
          
          return this.financialData;
        } catch (apiError) {
          console.error('Failed to fetch data from API:', apiError);
          // Fall back to mock data if API fails
          this.financialData = mockFinancialData;
          return this.financialData;
        }
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Fallback to mock data in case of any errors
      this.financialData = mockFinancialData;
      return this.financialData;
    }
  }

  /**
   * Process a user message and generate a response
   * @param {string} message - The user's message
   * @returns {Promise<string>} - The bot's response
   */
  async processMessage(message) {
    try {
      // Fetch latest financial data
      const financialData = await this.fetchFinancialData();
      
      // Check for special commands first
      const lowerMessage = message.toLowerCase();

      // Special test command to check AI mode (for internal use)
      if (lowerMessage === 'test_ai_mode') {
        if (this.useAI) {
          try {
            return await processWithAI("Test query", financialData);
          } catch (error) {
            return "[AI DISABLED] Testing error";
          }
        } else {
          return "[AI DISABLED] AI processing is currently disabled.";
        }
      }
      
      // Debug mode toggle
      if (lowerMessage === 'debug mode') {
        this.useAI = !this.useAI;
        return `AI processing is now ${this.useAI ? 'enabled' : 'disabled'}.`;
      }
      
      // Mock mode toggle (for development/testing)
      if (lowerMessage === 'toggle mock mode' && process.env.NODE_ENV !== 'production') {
        this.mockMode = !this.mockMode;
        this.financialData = null; // Clear cached data to force refetch
        return `Mock data mode is now ${this.mockMode ? 'enabled' : 'disabled'}.`;
      }
      
      // Process with AI if enabled
      if (this.useAI) {
        try {
          const aiResponse = await processWithAI(message, financialData);
          if (aiResponse) {
            return aiResponse;
          }
        } catch (aiError) {
          console.error('Error with AI processing:', aiError);
          // Fall through to rule-based responses if AI fails
        }
      }
      
      // Fallback to rule-based responses if AI is disabled or fails
      return this.getRuleBasedResponse(message, financialData);
    } catch (error) {
      console.error('Error in chatbot service:', error);
      return "Sorry, I encountered an error while processing your request. Please try again later.";
    }
  }

  /**
   * Get a rule-based response based on keyword matching
   * This is used as a fallback when AI is disabled or fails
   */
  getRuleBasedResponse(message, data) {
    const lowerMessage = message.toLowerCase();
    
    // Handle greetings
    if (/^(hi|hello|hey|greetings)/.test(lowerMessage)) {
      return "Hello! How can I help with your finances today?";
    }
    
    // Handle budget-related questions
    if (lowerMessage.includes('budget')) {
      if (lowerMessage.includes('groceries')) {
        const budget = data.budgets.find(b => b.category === "Groceries");
        return `Your Groceries budget is $${budget.limit.toFixed(2)} and you've spent $${budget.spent.toFixed(2)} (${Math.round(budget.spent/budget.limit*100)}%) so far this month.`;
      }
      
      if (lowerMessage.includes('dining')) {
        const budget = data.budgets.find(b => b.category === "Dining Out");
        return `Your Dining Out budget is $${budget.limit.toFixed(2)} and you've spent $${budget.spent.toFixed(2)} (${Math.round(budget.spent/budget.limit*100)}%) so far this month.`;
      }
      
      // General budget overview
      return `Your overall budget utilization is at ${Math.round(data.summary.totalSpent/data.summary.totalBudget*100)}% this month. Your biggest category is "${data.summary.topCategories[0]}" at ${Math.round(data.budgets[0].spent/data.budgets[0].limit*100)}% of its budget.`;
    }
    
    // Handle transaction-related questions
    if (lowerMessage.includes('transaction') || lowerMessage.includes('spent') || lowerMessage.includes('purchase')) {
      if (lowerMessage.includes('recent')) {
        const recent = data.transactions.slice(0, 3);
        return `Your most recent transactions were: $${recent[0].amount} at ${recent[0].merchant}, $${recent[1].amount} at ${recent[1].merchant}, and $${recent[2].amount} at ${recent[2].merchant}.`;
      }
      
      if (lowerMessage.includes('groceries')) {
        const groceries = data.transactions.filter(t => t.category === "Groceries");
        return `You've spent $${groceries.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} on Groceries this month across ${groceries.length} transactions.`;
      }
      
      return `You've spent $${data.summary.totalSpent.toFixed(2)} so far this month. That's ${Math.abs(data.summary.lastMonthComparison)}% ${data.summary.lastMonthComparison < 0 ? 'less' : 'more'} than the same time last month!`;
    }
    
    // Handle savings-related questions
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return `Based on your current spending rate, you're on track to save $${data.summary.currentSavings.toFixed(2)} this month toward your goal of $${data.summary.savingsGoal.toFixed(2)}.`;
    }
    
    // Handle category-related questions
    if (lowerMessage.includes('categor')) {
      return `Your top spending categories this month are: 1. ${data.summary.topCategories[0]} ($${data.budgets[0].spent.toFixed(2)}), 2. ${data.summary.topCategories[1]} ($${data.budgets[2].spent.toFixed(2)}), 3. ${data.summary.topCategories[2]} ($${data.budgets[1].spent.toFixed(2)}).`;
    }
    
    // Handle help request
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return `I can answer questions about your spending, budgets, transactions, and financial summaries using both your actual data and AI capabilities. Try asking about:
- Your recent transactions
- Budget status for specific categories
- Overall spending this month
- Savings progress
- Top spending categories
- Financial advice for your situation`;
    }
    
    // Default response for unrecognized queries
    return "I'm not sure I understand. You can ask me about your transactions, spending patterns, budgets, or savings goals. Try asking 'What can you help me with?' for some examples.";
  }
}

export const chatbotService = new ChatbotService();
