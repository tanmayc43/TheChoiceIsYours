import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from './contexts/ThemeContext';
import { AppStateProvider } from './contexts/AppStateContext';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Watchlist from './pages/Watchlist';
import Random from './pages/Random';
import { TransitionManager } from './components/TransitionManager';

function App() {
  const [currentPath, setCurrentPath] = useState("/");
  const [transitionState, setTransitionState] = useState({
    active: false,
    color: null,
    targetPath: null,
    phase: null,
    origin: { x: 0, y: 0 }
  });

  // Handle navigation with transitions
  const navigateWithTransition = useCallback((to, color = 'blue', origin = { x: window.innerWidth/2, y: window.innerHeight/2 }) => {
    setTransitionState({
      active: true,
      color,
      targetPath: to,
      phase: 'zoom',
      origin
    });
  }, []);

  // Only update the path after transition completes
  useEffect(() => {
    if (transitionState.active && transitionState.targetPath) {
      const timer = setTimeout(() => {
        setCurrentPath(transitionState.targetPath);
        setTransitionState(prev => ({ ...prev, active: false, targetPath: null }));
      }, 4500); // Match the total transition duration

      return () => clearTimeout(timer);
    }
  }, [transitionState]);

  return (
    <ThemeProvider>
      <AppStateProvider>
        <Router>
          <TransitionManager>
            <AnimatePresence mode="wait">
              <Routes key={currentPath}>
                <Route path="/" element={<Home />} />
                <Route path="/choice" element={<Choice />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/random" element={<Random />} />
              </Routes>
            </AnimatePresence>
          </TransitionManager>
        </Router>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;