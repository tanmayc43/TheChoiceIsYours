import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from './contexts/ThemeContext';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Random from './pages/Random';
import Recommend from './pages/Recommend'; 

function App() {
  return (
    <ThemeProvider>
      <Router>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/random" element={<Random />} />
          </Routes>
        </PageTransition>
      </Router>
    </ThemeProvider>
  );
}

export default App;