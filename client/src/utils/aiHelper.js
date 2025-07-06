/**
 * AI Helper for integrating with Google's Generative AI (Gemini)
 * Enhanced with improved NLP capabilities for financial queries
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Generative AI API with your API key
// In a production environment, this should be stored in environment variables
// For development, you can uncomment and use the line below with your actual API key
// const API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; 
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

// Check if API key is set properly
let genAI;
try {
  if (API_KEY === "YOUR_GEMINI_API_KEY") {
    console.warn("Warning: Gemini API key not configured. Using fallback responses.");
    console.warn("To use AI features, you need to:");
    console.warn("1. Get an API key from https://ai.google.dev/");
    console.warn("2. Create a .env file in the client directory");
    console.warn("3. Add REACT_APP_GEMINI_API_KEY=your_api_key to the file");
    console.warn("4. Restart the development server");
  } else {
    console.log("Gemini API key found, AI features should be working");
  }
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
}

// Cache for recent queries to improve response time
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Process a user query with Gemini AI with enhanced NLP
 * @param {string} query - The user's question
 * @param {object} financialContext - User's financial data for context
 * @returns {Promise<string>} - The AI-generated response
 */
export async function processWithAI(query, financialContext) {
  try {
    // Return fallback response if API key is not valid
    if (!genAI || API_KEY === "YOUR_GEMINI_API_KEY") {
      console.warn("Using fallback response due to missing API key");
      // For debugging, add a prefix to show it's using fallback mode
      const fallbackResponse = getFallbackResponse(query, financialContext);
      return `[AI DISABLED - Using basic response mode] ${fallbackResponse}`;
    }

    // Check cache first
    const cacheKey = `${query}_${JSON.stringify(financialContext.summary)}`;
    const cachedResponse = queryCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
      console.log("Using cached response");
      return cachedResponse.response;
    }
    
    // Preprocess the query for better understanding
    const enhancedQuery = await preprocessQuery(query);
    
    // Create a more structured prompt with financial context
    const prompt = createPromptWithContext(enhancedQuery, financialContext);
    
    // Get the generative model (Gemini)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2, // Lower temperature for more factual responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    });
    
    // Generate content from the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Save to cache
    queryCache.set(cacheKey, {
      response: text,
      timestamp: Date.now()
    });
    
    return text;
  } catch (error) {
    console.error("Error using Generative AI:", error);
    
    // Fallback response if AI fails
    return getFallbackResponse(query, financialContext);
  }
}

/**
 * Preprocesses the query to understand intent and extract entities
 * Uses Gemini's capabilities for NLP understanding
 */
async function preprocessQuery(query) {
  try {
    if (!genAI) return query;
    
    const nlpModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
I want you to analyze this financial question and help me understand the user's intent.
Identify the main category (budget, transaction, savings, summary, advice) and any specific
entities mentioned (dates, categories, amounts).

User question: "${query}"

Just return the enhanced version of the query with better structure and clarity. Don't add 
any explanation or preamble.
`;

    const result = await nlpModel.generateContent(prompt);
    const enhancedQuery = await result.response.text();
    return enhancedQuery.trim();
  } catch (error) {
    console.warn("NLP preprocessing failed:", error);
    return query; // Return original query if preprocessing fails
  }
}

/**
 * Creates a structured prompt with financial context for better AI responses
 * Enhanced with more comprehensive data organization and NLP understanding
 */
function createPromptWithContext(query, financialContext) {
  // Calculate some helpful summary stats from the data
  const totalBudget = financialContext.budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = financialContext.budgets.reduce((sum, b) => sum + b.spent, 0);
  const spendingRate = totalSpent / totalBudget;
  
  // Calculate category-specific insights for the prompt
  const categoryInsightsArray = financialContext.categories.map(category => {
    const transactions = financialContext.transactions.filter(t => t.category === category.name);
    const budget = financialContext.budgets.find(b => b.category === category.name);
    
    if (!budget || transactions.length === 0) return null;
    
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const percentOfBudget = budget ? Math.round((totalSpent / budget.limit) * 100) : 'N/A';
    const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;
    
    return {
      name: category.name,
      transactions: transactions.length,
      spent: totalSpent.toFixed(2),
      budget: budget?.limit.toFixed(2) || 'No budget',
      percentUsed: percentOfBudget,
      avgTransaction: avgTransaction.toFixed(2)
    };
  }).filter(Boolean);
  
  // Format category insights for the prompt
  const categoryInsights = categoryInsightsArray.map(c => 
    `- ${c.name}: Spent $${c.spent} of $${c.budget} budget (${c.percentUsed}%), ${c.transactions} transactions, avg $${c.avgTransaction} per transaction`
  ).join('\n');
  
  // Organize transactions by date for trend analysis
  const transactionsByDate = {};
  financialContext.transactions.forEach(t => {
    const date = t.date;
    if (!transactionsByDate[date]) transactionsByDate[date] = [];
    transactionsByDate[date].push(t);
  });
  
  // Format recent transactions for context
  const recentTransactions = financialContext.transactions
    .slice(0, 5)
    .map(t => `- ${t.date}: $${t.amount} at ${t.merchant} (${t.category})`)
    .join('\n');
  
  // Format budget information
  const budgetInfo = financialContext.budgets
    .map(b => {
      const percent = Math.round(b.spent/b.limit*100);
      const status = percent > 90 ? '⚠️ ALERT' : percent > 75 ? '⚠️ Warning' : '✅ Good';
      return `- ${b.category}: $${b.spent.toFixed(2)}/$${b.limit.toFixed(2)} (${percent}%) ${status}`;
    })
    .join('\n');

  // Create financial insights
  const insights = [
    spendingRate > 0.9 ? "⚠️ User is close to exceeding their total budget." : "",
    financialContext.summary.lastMonthComparison > 10 ? "⚠️ Spending has increased significantly compared to last month." : "",
    financialContext.summary.currentSavings < (financialContext.summary.savingsGoal * 0.5) ? "⚠️ User is behind on their savings goal." : "",
    financialContext.budgets.some(b => b.spent/b.limit > 0.9) ? `⚠️ Some budget categories are nearly depleted: ${financialContext.budgets.filter(b => b.spent/b.limit > 0.9).map(b => b.category).join(', ')}` : ""
  ].filter(Boolean).join('\n');

  // Get income data
  const incomeTransactions = financialContext.transactions.filter(t => t.type === 'income');
  const totalIncome = financialContext.summary.totalIncome || 
                      incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalIncome - totalSpent;
  
  // Create a comprehensive system prompt with enhanced structure
  return `
You are an advanced financial assistant for a personal finance app with NLP capabilities.
Your job is to analyze and answer questions about the user's financial data with accuracy and insight.

USER'S FINANCIAL CONTEXT:
Current Month: July 2025
Total Income: $${totalIncome.toFixed(2)}
Total Spent: $${totalSpent.toFixed(2)} (${Math.round(spendingRate*100)}% of budget)
Net Cash Flow: $${netCashflow.toFixed(2)}
Total Budget: $${totalBudget.toFixed(2)}
Savings Goal: $${financialContext.summary.savingsGoal.toFixed(2)}
Current Savings Progress: $${financialContext.summary.currentSavings.toFixed(2)}
Income Change: ${financialContext.summary.lastMonthIncomeComparison || 0}% compared to last month
Spending Change: ${financialContext.summary.lastMonthComparison}% compared to last month

RECENT TRANSACTIONS:
${recentTransactions}

BUDGET STATUS:
${budgetInfo}

CATEGORY INSIGHTS:
${categoryInsights}

TOP SPENDING CATEGORIES:
1. ${financialContext.summary.topCategories[0]}
2. ${financialContext.summary.topCategories[1]}
3. ${financialContext.summary.topCategories[2]}

${insights ? `FINANCIAL INSIGHTS:\n${insights}` : ''}

USER QUESTION: ${query}

Instructions:
1. Answer directly from the data provided. Be specific and precise.
2. If answering a question requires financial calculations, perform them accurately.
3. For category-specific questions, provide relevant statistics and trends.
4. If the question is about general financial advice not related to the specific data, provide helpful guidance based on personal finance best practices.
5. Keep responses concise (under 100 words) and user-friendly.
6. Format currency with $ and two decimal places, percentages as whole numbers.
7. If you absolutely cannot answer from the provided data, say so clearly and offer a general financial tip instead.
8. Include any relevant warnings about budget categories that are close to exceeding their limits.
`;
}

/**
 * Fallback responses when AI is unavailable
 * Provides rule-based responses based on keywords in the query
 */
function getFallbackResponse(query, financialContext) {
  const lowerQuery = query.toLowerCase();
  
  // Help with API setup
  if (lowerQuery.includes('gemini') || lowerQuery.includes('ai') || 
      lowerQuery.includes('api key') || lowerQuery.includes('not working')) {
    return `Gemini is Google's AI model that powers the advanced responses in this chatbot. To enable AI features:
1. Get an API key from https://ai.google.dev/
2. Create a .env file in the client directory
3. Add REACT_APP_GEMINI_API_KEY=your_api_key to the file
4. Restart the development server

Currently, the chatbot is operating in basic mode with rule-based responses only.`;
  }

  // Income-related questions
  if (lowerQuery.includes('income') || lowerQuery.includes('earn') || lowerQuery.includes('salary') || 
      lowerQuery.includes('revenue') || lowerQuery.includes('cash flow') || lowerQuery.includes('cashflow')) {
    
    // Calculate income data
    const incomeTransactions = financialContext.transactions.filter(t => t.type === 'income');
    const totalIncome = financialContext.summary.totalIncome || 
                        incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Monthly income
    if (lowerQuery.includes('month') || lowerQuery.includes('current')) {
      const currentMonthIncome = incomeTransactions
        .filter(t => t.date.startsWith('2025-07'))
        .reduce((sum, t) => sum + t.amount, 0);
      
      return `Your income for July 2025 so far is $${currentMonthIncome.toFixed(2)}. This is ${Math.abs(financialContext.summary.lastMonthIncomeComparison)}% ${financialContext.summary.lastMonthIncomeComparison >= 0 ? 'more' : 'less'} than last month.`;
    }
    
    // Income sources
    if (lowerQuery.includes('source') || lowerQuery.includes('categor')) {
      const sources = financialContext.summary.incomeCategories || 
                     [...new Set(incomeTransactions.map(t => t.category))];
      return `Your income sources are: ${sources.join(', ')}. Your primary income source is ${sources[0]}.`;
    }
    
    // Recent income
    if (lowerQuery.includes('recent')) {
      const recentIncome = incomeTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2);
      
      return `Your most recent income transactions were: $${recentIncome[0].amount.toFixed(2)} from ${recentIncome[0].merchant} (${recentIncome[0].category}) on ${recentIncome[0].date}, and $${recentIncome[1].amount.toFixed(2)} from ${recentIncome[1].merchant} (${recentIncome[1].category}) on ${recentIncome[1].date}.`;
    }
    
    // Total income / generic income question
    return `Your total income is $${totalIncome.toFixed(2)}. After expenses of $${financialContext.summary.totalSpent.toFixed(2)}, your net cash flow is $${(totalIncome - financialContext.summary.totalSpent).toFixed(2)}.`;
  }
  
  // Budget-related questions
  if (lowerQuery.includes('budget')) {
    // Check if query mentions a specific category
    const categoryMatch = financialContext.categories.find(cat => 
      lowerQuery.includes(cat.name.toLowerCase())
    );
    
    if (categoryMatch) {
      const budget = financialContext.budgets.find(b => b.category === categoryMatch.name);
      if (budget) {
        const percentUsed = Math.round(budget.spent/budget.limit*100);
        const status = percentUsed > 90 ? 'critical' : percentUsed > 75 ? 'warning' : 'good';
        return `Your ${budget.category} budget is $${budget.limit.toFixed(2)} and you've spent $${budget.spent.toFixed(2)} (${percentUsed}%). Budget status: ${status}.`;
      }
    }
    
    return `Your overall budget utilization is at ${Math.round(financialContext.summary.totalSpent/financialContext.summary.totalBudget*100)}% this month. Your biggest category is "${financialContext.summary.topCategories[0]}" at ${Math.round(financialContext.budgets[0].spent/financialContext.budgets[0].limit*100)}% of its budget.`;
  }
  
  // Transaction-related questions
  if (lowerQuery.includes('transaction') || lowerQuery.includes('spent') || lowerQuery.includes('purchase')) {
    // Check for specific category
    const categoryMatch = financialContext.categories.find(cat => 
      lowerQuery.includes(cat.name.toLowerCase())
    );
    
    if (categoryMatch) {
      const categoryTransactions = financialContext.transactions.filter(t => t.category === categoryMatch.name);
      if (categoryTransactions.length > 0) {
        const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        return `You've spent $${totalSpent.toFixed(2)} on ${categoryMatch.name} across ${categoryTransactions.length} transactions.`;
      }
    }
    
    // Check for "recent" keyword
    if (lowerQuery.includes('recent')) {
      const recent = financialContext.transactions.slice(0, 3);
      return `Your most recent transactions were: $${recent[0].amount} at ${recent[0].merchant} (${recent[0].date}), $${recent[1].amount} at ${recent[1].merchant} (${recent[1].date}), and $${recent[2].amount} at ${recent[2].merchant} (${recent[2].date}).`;
    }
    
    return `You've spent $${financialContext.summary.totalSpent.toFixed(2)} so far this month. That's ${Math.abs(financialContext.summary.lastMonthComparison)}% ${financialContext.summary.lastMonthComparison < 0 ? 'less' : 'more'} than the same time last month.`;
  }
  
  // Category-related questions
  if (lowerQuery.includes('categor')) {
    if (lowerQuery.includes('top')) {
      return `Your top spending categories this month are: 
1. ${financialContext.summary.topCategories[0]} ($${financialContext.budgets.find(b => b.category === financialContext.summary.topCategories[0]).spent.toFixed(2)})
2. ${financialContext.summary.topCategories[1]} ($${financialContext.budgets.find(b => b.category === financialContext.summary.topCategories[1]).spent.toFixed(2)})
3. ${financialContext.summary.topCategories[2]} ($${financialContext.budgets.find(b => b.category === financialContext.summary.topCategories[2]).spent.toFixed(2)})`;
    }
    
    return `You have ${financialContext.categories.length} spending categories. Your top categories this month are ${financialContext.summary.topCategories.join(', ')}.`;
  }
  
  // Savings-related questions
  if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
    const savingsPercentage = Math.round((financialContext.summary.currentSavings / financialContext.summary.savingsGoal) * 100);
    return `Based on your current spending rate, you're on track to save $${financialContext.summary.currentSavings.toFixed(2)} this month toward your goal of $${financialContext.summary.savingsGoal.toFixed(2)} (${savingsPercentage}% of your goal).`;
  }
  
  // Default response
  return `[AI DISABLED] I'm currently in Basic Mode due to a missing API key. 

Here's a summary of your finances: You've spent $${financialContext.summary.totalSpent.toFixed(2)} so far this month, which is ${Math.abs(financialContext.summary.lastMonthComparison)}% ${financialContext.summary.lastMonthComparison < 0 ? 'less' : 'more'} than last month.

To enable AI mode and get better answers, set up your API key by asking "How do I set up the API key?" or checking the CHATBOT_FIX.md file.`;
}
