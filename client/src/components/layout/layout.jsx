import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Dark mode toggle
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);
  
  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-background-light/10 dark:hover:bg-background-dark/10 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-primary-600 hover:text-primary-500 transition-colors">
          <span className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="currentColor"/>
              <path d="M12 6L9 14H15L12 6Z" fill="white"/>
            </svg>
            Finance Tracker
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export const NavLink = ({ to, end = false, children, className, ...props }) => {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary-500 relative group',
        isActive 
          ? 'text-primary-500 dark:text-primary-400' 
          : 'text-foreground-light dark:text-foreground-dark',
        className
      )}
      {...props}
    >
      {children}
      <span className={cn(
        'absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-200 group-hover:w-full',
        isActive ? 'w-full' : 'w-0'
      )} />
    </Link>
  );
};

export const PageHeader = ({ title, description, className, ...props }) => {
  return (
    <div className={cn('pb-4 mb-6 border-b border-border-light dark:border-border-dark', className)} {...props}>
      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-accent bg-clip-text text-transparent">{title}</h1>
      {description && (
        <p className="text-muted-light dark:text-muted-dark mt-1">{description}</p>
      )}
    </div>
  );
};

export const PageContainer = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('container px-4 sm:px-6 lg:px-8 py-6 mx-auto transition-all duration-200 scrollbar', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      <Header />
      <main className="min-h-[calc(100vh-10rem)]">
        {children}
      </main>
      <footer className="border-t border-border-light dark:border-border-dark py-6 mt-8">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto text-center text-muted-light dark:text-muted-dark text-sm">
          © {new Date().getFullYear()} Finance Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
