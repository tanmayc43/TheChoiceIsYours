import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from './contexts/ThemeContext';
import { AppStateProvider } from './contexts/AppStateContext';
import PageTransition from './components/PageTransition';
import FirstTimeLoader from './components/FirstTimeLoader';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Watchlist from './pages/Watchlist';
import Random from './pages/Random';

function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <Router>
          <FirstTimeLoader />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/choice" element={<Choice />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/random" element={<Random />} />
            </Routes>
          </PageTransition>
        </Router>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;