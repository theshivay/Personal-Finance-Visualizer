import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import ChatbotAssistant from '../ui/ChatbotAssistant';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

// Dark mode toggle
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = (e) => {
    // Get click coordinates for the radial animation
    const rect = e?.target?.getBoundingClientRect?.() || {};
    const x = e?.clientX || rect?.left || window.innerWidth / 2;
    const y = e?.clientY || rect?.top || window.innerHeight / 2;
    
    // Button animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Determine the target theme
    const toTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    
    // Dispatch custom event for the overlay animation
    const themeChangeEvent = new CustomEvent('themechange', {
      detail: { 
        x, 
        y,
        theme: toTheme
      }
    });
    window.dispatchEvent(themeChangeEvent);
    
    // Switch the theme after a slight delay for visual effect
    setTimeout(() => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
      }
    }, 150);
  };
  
  return (
    <button 
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme(e);
        }
      }}
      className={`
        relative p-2 h-10 w-10 rounded-full touch-target touch-ripple
        bg-gradient-to-br ${isDark 
          ? 'from-slate-700 to-slate-900 text-yellow-300 shadow-inner shadow-slate-900/50' 
          : 'from-blue-300 to-sky-500 text-amber-50 shadow-md shadow-sky-500/30'
        }
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-background-dark
        transition-all duration-300 ease-in-out
        ${isAnimating ? 'animate-pulse scale-110' : ''}
      `}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-checked={isDark}
      role="switch"
      tabIndex="0"
    >
      {/* Animated Background Effects */}
      {isDark ? (
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute w-1 h-1 bg-white rounded-full top-2 left-3 opacity-80"></span>
          <span className="absolute w-1 h-1 bg-white rounded-full top-4 left-6 opacity-60"></span>
          <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-6 left-2 opacity-40"></span>
          <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-5 left-7 opacity-50"></span>
        </span>
      ) : (
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute w-6 h-6 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full -top-1 -right-1 opacity-90 blur-sm"></span>
        </span>
      )}
      
      {/* Main Icon */}
      <span className="relative z-10 flex items-center justify-center transition-transform duration-500 transform">
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm9 9h-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zm-9 7a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0v-1a1 1 0 0 0-1-1zM4 12a1 1 0 0 0-1-1H2a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1zm13.7-8.3a1 1 0 0 0-1.4 1.4l.7.7a1 1 0 1 0 1.4-1.4l-.7-.7zM6.3 18.7a1 1 0 0 0-1.4 1.4l.7.7a1 1 0 1 0 1.4-1.4l-.7-.7zM12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        )}
      </span>
    </button>
  );
};

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    if (menuOpen) {
      // Animate menu close
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.add('animate-fade-out');
        setTimeout(() => {
          setMenuOpen(false);
        }, 200);
      } else {
        setMenuOpen(false);
      }
    } else {
      // Open menu immediately
      setMenuOpen(true);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('#mobile-menu') && 
          !event.target.closest('#menu-toggle')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-card-light/90 dark:bg-card-dark/90 backdrop-blur-md shadow-sm dark:shadow-slate-900/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent/5 dark:from-primary-800/5 dark:to-accent/5 pointer-events-none"></div>
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 relative">
        <Link to="/" className="text-xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-accent bg-clip-text hover:opacity-80 transition-all duration-300">
          <span className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="currentColor"/>
                <path d="M12 6L9 14H15L12 6Z" fill="white"/>
              </svg>
            </div>
            <span className="hidden sm:inline">Finance Tracker</span>
            <span className="sm:hidden">FTrack</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-5 sm:gap-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <NavLink 
              to="/" 
              end 
              className="px-3 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-100/70 dark:hover:bg-blue-900/20"
            >
              <svg className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Dashboard
            </NavLink>
            <NavLink 
              to="/transactions" 
              className="px-3 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-green-100/70 dark:hover:bg-green-900/20"
            >
              <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Transactions
            </NavLink>
            <NavLink 
              to="/categories" 
              className="px-3 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-purple-100/70 dark:hover:bg-purple-900/20"
            >
              <svg className="w-4 h-4 mr-1.5 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
              </svg>
              Categories
            </NavLink>
            <NavLink 
              to="/budgets" 
              className="px-3 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-amber-100/70 dark:hover:bg-amber-900/20"
            >
              <svg className="w-4 h-4 mr-1.5 text-amber-500 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Budgets
            </NavLink>
          </div>
          <div className="h-6 w-px bg-border-light dark:bg-border-dark mx-1"></div>
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button 
            id="menu-toggle"
            onClick={toggleMenu} 
            className={`
              p-2 h-10 w-10 rounded-full touch-target touch-ripple flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${menuOpen 
                ? 'bg-gradient-to-br from-red-300 to-red-500 text-white shadow-md shadow-red-500/30' 
                : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-500/30'
              }
              hover:shadow-lg active:scale-95
            `}
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div 
          id="mobile-menu"
          className="fixed inset-0 top-16 z-40 bg-gradient-to-b from-card-light/98 to-card-light/95 dark:from-gray-900/98 dark:to-slate-900/95 backdrop-blur-md md:hidden animate-fade-in"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary-500/10 to-transparent dark:from-primary-600/15 dark:to-transparent"></div>
            
            {/* Animated background patterns - enhanced for dark mode */}
            <div className="absolute inset-0 opacity-10 dark:opacity-10 pointer-events-none">
              <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-blue-500 dark:bg-blue-400 blur-3xl"></div>
              <div className="absolute top-[30%] right-[15%] w-40 h-40 rounded-full bg-purple-500 dark:bg-purple-400 blur-3xl"></div>
              <div className="absolute bottom-[20%] left-[20%] w-36 h-36 rounded-full bg-amber-500 dark:bg-amber-400 blur-3xl"></div>
              <div className="absolute bottom-[15%] right-[10%] w-28 h-28 rounded-full bg-green-500 dark:bg-green-400 blur-3xl"></div>
            </div>
          </div>
          <nav className="container relative flex flex-col items-center py-10 gap-5 text-lg w-full max-w-xs mx-auto">
            {/* Dashboard Button with blue gradient - enhanced dark mode */}
            <NavLink 
              to="/" 
              end 
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-item w-full py-4 px-6 rounded-xl flex items-center justify-between 
                bg-gradient-to-r from-blue-500/20 to-blue-600/10
                dark:bg-gradient-to-r dark:from-blue-900/80 dark:to-blue-800/60
                shadow-md hover:shadow-lg dark:shadow-blue-900/40
                border border-blue-200 dark:border-blue-700/60
                hover:border-blue-300 dark:hover:border-blue-600
                backdrop-blur-sm transition-all duration-300
                touch-ripple active:scale-[0.98]"
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-lg mr-3 flex items-center justify-center
                  bg-gradient-to-br from-blue-400 to-blue-600 
                  dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-600
                  text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/50">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span className="font-medium dark:text-white">Dashboard</span>
              </div>
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </NavLink>
            
            {/* Transactions Button with green gradient - enhanced dark mode */}
            <NavLink 
              to="/transactions" 
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-item w-full py-4 px-6 rounded-xl flex items-center justify-between 
                bg-gradient-to-r from-green-500/20 to-green-600/10
                dark:bg-gradient-to-r dark:from-green-900/80 dark:to-green-800/60
                shadow-md hover:shadow-lg dark:shadow-green-900/40
                border border-green-200 dark:border-green-700/60
                hover:border-green-300 dark:hover:border-green-600
                backdrop-blur-sm transition-all duration-300
                touch-ripple active:scale-[0.98]"
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-lg mr-3 flex items-center justify-center
                  bg-gradient-to-br from-green-400 to-green-600 
                  dark:bg-gradient-to-br dark:from-green-400 dark:to-green-600
                  text-white shadow-md shadow-green-500/30 dark:shadow-green-500/50">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <span className="font-medium dark:text-white">Transactions</span>
              </div>
              <svg className="w-5 h-5 text-green-500 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </NavLink>
            
            {/* Categories Button with purple gradient - enhanced dark mode */}
            <NavLink 
              to="/categories" 
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-item w-full py-4 px-6 rounded-xl flex items-center justify-between
                bg-gradient-to-r from-purple-500/20 to-purple-600/10
                dark:bg-gradient-to-r dark:from-purple-900/80 dark:to-purple-800/60
                shadow-md hover:shadow-lg dark:shadow-purple-900/40
                border border-purple-200 dark:border-purple-700/60
                hover:border-purple-300 dark:hover:border-purple-600
                backdrop-blur-sm transition-all duration-300
                touch-ripple active:scale-[0.98]"
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-lg mr-3 flex items-center justify-center
                  bg-gradient-to-br from-purple-400 to-purple-600
                  dark:bg-gradient-to-br dark:from-purple-400 dark:to-purple-600
                  text-white shadow-md shadow-purple-500/30 dark:shadow-purple-500/50">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                  </svg>
                </div>
                <span className="font-medium dark:text-white">Categories</span>
              </div>
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </NavLink>
            
            {/* Budgets Button with amber/orange gradient - enhanced dark mode */}
            <NavLink 
              to="/budgets" 
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-item w-full py-4 px-6 rounded-xl flex items-center justify-between 
                bg-gradient-to-r from-amber-500/20 to-amber-600/10
                dark:bg-gradient-to-r dark:from-amber-900/80 dark:to-amber-800/60
                shadow-md hover:shadow-lg dark:shadow-amber-900/40
                border border-amber-200 dark:border-amber-700/60
                hover:border-amber-300 dark:hover:border-amber-600
                backdrop-blur-sm transition-all duration-300
                touch-ripple active:scale-[0.98]"
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-lg mr-3 flex items-center justify-center
                  bg-gradient-to-br from-amber-400 to-amber-600
                  dark:bg-gradient-to-br dark:from-amber-400 dark:to-amber-600
                  text-white shadow-md shadow-amber-500/30 dark:shadow-amber-500/50">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <span className="font-medium dark:text-white">Budgets</span>
              </div>
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </NavLink>
          </nav>
        </div>
      )}
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
        'text-sm font-medium transition-all duration-300 hover:text-primary-500 relative group touch-ripple',
        isActive 
          ? 'text-primary-500 dark:text-primary-400 font-semibold' 
          : 'text-foreground-light dark:text-foreground-dark',
        className
      )}
      {...props}
    >
      {children}
      {/* Only show underline indicator for default styling (without custom className overrides) */}
      {!className?.includes('bg-gradient') && (
        <span className={cn(
          'absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent transition-all duration-300 ease-out group-hover:w-full rounded-full',
          isActive ? 'w-full shadow-sm shadow-primary-500/30' : 'w-0'
        )} />
      )}
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
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center">
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://github.com/theshivay" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={24} />
              </a>
              <a 
                href="https://www.linkedin.com/in/shivam-mishra-a06654258/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
              <a 
                href="https://x.com/ShivamMish88131" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
            </div>
            <div className="text-center text-muted-light dark:text-muted-dark text-sm">
              © {new Date().getFullYear()} Finance Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Chatbot Assistant */}
      <ChatbotAssistant />
    </div>
  );
};
