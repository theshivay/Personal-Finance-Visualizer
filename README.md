# Personal Finance Visualizer

A comprehensive full-stack web application for tracking personal finances with detailed visualization capabilities. Monitor your transactions, categorize expenses, set budgets, and gain insights into your spending patterns through interactive charts and analytics.

![Personal Finance Visualizer](https://via.placeholder.com/800x400?text=Personal+Finance+Visualizer)

## ✨ Features

### Transaction Management
- **Add/Edit/Delete Transactions**: Track expenses and income with amount, date, description, and category
- **Transaction Filtering**: Filter by date range, category, or transaction type
- **Transaction List**: Sortable and paginated list view with search functionality

### Category Management
- **Custom Categories**: Create, edit, and delete expense and income categories
- **Color Coding**: Assign colors to categories for better visualization
- **Category Overview**: View spending patterns by category

### Budget Planning
- **Monthly Budgets**: Set spending limits for each category on a monthly basis
- **Budget Tracking**: Monitor progress with visual indicators showing budget vs. actual spending
- **Budget History**: Track budget performance over time

### Analytics & Visualizations
- **Dashboard Overview**: Quick summary of financial status with key metrics
- **Monthly Expenses Chart**: Bar chart showing expenses by month
- **Category Breakdown**: Interactive pie chart displaying spending by category
- **Budget Comparison**: Visual representation of planned vs. actual spending

### UI/UX Features
- **Responsive Design**: Fully responsive interface that works on mobile, tablet, and desktop
- **Modern UI Components**: Built with shadcn/ui for a clean, consistent look
- **Form Validation**: Comprehensive client-side validation for all forms
- **Error Handling**: Graceful error states with user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern component-based UI library
- **React Router 7**: For client-side routing with the latest features
- **Context API**: For global state management
- **Recharts**: Flexible charting library for data visualization
- **Axios**: Promise-based HTTP client for API requests
- **PropTypes**: Runtime type checking for React props
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality UI components built on Radix UI
- **date-fns**: Modern JavaScript date utility library

### Backend
- **Express.js**: Fast, unopinionated web framework for Node.js
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **RESTful API**: Well-structured endpoints following REST principles
- **Express Validator**: Middleware for request validation
- **Helmet**: Security middleware to protect Express apps
- **CORS**: Cross-Origin Resource Sharing support
- **Morgan**: HTTP request logger middleware
- **dotenv**: Environment variable management

## 📁 Project Structure

```
/client                # React frontend
  /public              # Public assets and static files
  /src                 # Source code
    /api               # API service layer with Axios
    /components        # Reusable UI components
      /budgets         # Budget-related components
      /categories      # Category-related components
      /charts          # Data visualization components
      /dashboard       # Dashboard components
      /layout          # Layout components (header, footer)
      /transactions    # Transaction-related components
      /ui              # Base UI components (buttons, inputs)
    /context           # React Context providers for global state
    /lib               # Utility functions and helpers
    /pages             # Page components
    
/server                # Express.js backend
  /models              # MongoDB/Mongoose data models
  /routes              # API route handlers
  /utils               # Utility functions and database seeders
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **MongoDB**: v4.0 or higher
- **npm**: v7.0.0 or higher

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/theshivay/Personal-Finance-Visualizer.git
cd Personal-Finance-Visualizer
```

2. **Server Setup**
```bash
cd server
npm install

# Create a .env file with:
# PORT=5001
# MONGODB_URI=mongodb://localhost:27017/finance-tracker
```

3. **Client Setup**
```bash
cd ../client
npm install
```

4. **Seed the database** (optional)
```bash
cd ../server
npm run seed
```

5. **Start the development servers**
```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend development server
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api

## 📊 Data Models

### Transaction
- `amount`: Number (positive for income, negative for expenses)
- `description`: String
- `date`: Date
- `type`: String (expense/income)
- `categoryId`: ObjectId (reference to Category)
- `paymentMethod`: String
- `notes`: String

### Category
- `name`: String
- `color`: String (hex color code)
- `icon`: String
- `type`: String (expense/income/both)
- `isDefault`: Boolean

### Budget
- `categoryId`: ObjectId (reference to Category)
- `amount`: Number
- `month`: Number (1-12)
- `year`: Number
- `notes`: String

## 📡 API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a transaction by ID
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a category by ID
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create a new budget
- `GET /api/budgets/:id` - Get a budget by ID
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget

### Analytics
- `GET /api/analytics/monthly-expenses` - Get expenses grouped by month
- `GET /api/analytics/category-breakdown` - Get expenses grouped by category
- `GET /api/analytics/budget-comparison` - Compare budgets with actual spending

## 📝 Development Guidelines

### Code Style
- Follow the ESLint configuration in the project
- Use meaningful variable and function names
- Comment complex logic and business rules

### Component Structure
- Keep components focused on a single responsibility
- Use PropTypes for component props validation
- Extract reusable logic into custom hooks

### State Management
- Use React Context for global state
- Keep component state local when possible
- Use state reducers for complex state logic

## 🔄 Development Workflow

1. **Setup**: Clone repo and install dependencies
2. **Development**: Make changes in a feature branch
3. **Testing**: Test changes in local environment
4. **Pull Request**: Submit PR with detailed description
5. **Code Review**: Address feedback and make necessary adjustments
6. **Merge**: Merge changes into main branch
7. **Deploy**: Deploy to production environment

## Contribution
Contributions are welcome! Feel free to submit a pull request or open an issue.

## Contact
If you have any questions or need further assistance, feel free to contact:

- **Developer**: Shivam Mishra
- **Website**: Personalised Finance Visualizer
- **Email**: shivammishraeee@gmail.com