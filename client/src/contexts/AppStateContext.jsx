import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('matrix-film-intro-seen') === 'true';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilm, setCurrentFilm] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const markIntroSeen = () => {
    setHasSeenIntro(true);
    localStorage.setItem('matrix-film-intro-seen', 'true');
  };

  const resetIntro = () => {
    setHasSeenIntro(false);
    localStorage.removeItem('matrix-film-intro-seen');
  };

  return (
    <AppStateContext.Provider value={{
      hasSeenIntro,
      markIntroSeen,
      resetIntro,
      isLoading,
      setIsLoading,
      currentFilm,
      setCurrentFilm,
      prefersReducedMotion
    }}>
      {children}
    </AppStateContext.Provider>
  );
};