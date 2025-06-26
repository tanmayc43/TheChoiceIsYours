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
  return (
    <ThemeProvider>
      <AppStateProvider>
        <Router>
          <TransitionManager>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/choice" element={<Choice />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/random" element={<Random />} />
              </Routes>
            </PageTransition>
          </TransitionManager>
        </Router>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;