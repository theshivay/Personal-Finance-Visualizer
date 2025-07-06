import React, { useEffect, useRef } from 'react';

/**
 * Theme Transition Overlay Component
 * 
 * Provides a radial animation when switching between light and dark themes
 */
const ThemeTransitionOverlay = () => {
  const overlayRef = useRef(null);

  useEffect(() => {
    // Create the event handler
    const handleThemeChange = (e) => {
      if (!overlayRef.current) return;
      
      const overlay = overlayRef.current;
      
      // Get coordinates from event or use center of screen
      const x = e?.detail?.x || window.innerWidth / 2;
      const y = e?.detail?.y || window.innerHeight / 2;
      
      // Set position variables for the radial gradient
      overlay.style.setProperty('--x', `${x}px`);
      overlay.style.setProperty('--y', `${y}px`);
      
      // Get theme direction
      const toTheme = e?.detail?.theme || 
                     (document.documentElement.classList.contains('dark') ? 'light' : 'dark');
      
      // Apply animation classes
      overlay.className = `theme-transition-overlay animating to-${toTheme}`;
      
      // Remove animation class after transition completes
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.className = 'theme-transition-overlay';
        }
      }, 800);
    };

    // Add custom event listener
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return (
    <div 
      ref={overlayRef} 
      className="theme-transition-overlay" 
      aria-hidden="true"
      data-testid="theme-transition-overlay"
    />
  );
};

export default ThemeTransitionOverlay;
