import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom'; // <-- No Router import needed
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { TransitionManager } from "./components/TransitionManager";
import Home from './pages/Home';
import Choice from './pages/Choice';
import Watchlist from './pages/Watchlist';
import Recommend from './pages/Recommend';
import Test from './pages/Test';

function App() {
  const location = useLocation(); // This will now work correctly

  useEffect(() => {
    const img = new window.Image();
    img.src = '/sheesh.png';
  }, []);

  return(
    <ThemeProvider>
      <AppStateProvider>
        {/* The <Router> component is GONE from this file */}
        <TransitionManager>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/choice" element={<Choice />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/recommend" element={<Recommend />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </AnimatePresence>
        </TransitionManager>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;