import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-primary-600">
          Finance Tracker
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
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
        'text-sm font-medium transition-colors hover:text-primary-600',
        isActive ? 'text-primary-600' : 'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export const PageHeader = ({ title, description, className, ...props }) => {
  return (
    <div className={cn('pb-4 mb-4 border-b', className)} {...props}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted mt-1">{description}</p>
      )}
    </div>
  );
};

export const PageContainer = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('container px-4 sm:px-6 lg:px-8 py-6 mx-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto text-center text-muted text-sm">
          © {new Date().getFullYear()} Finance Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
