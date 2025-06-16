import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Random from './pages/Random';
import Recommend from './pages/Recommend'; 
import { TransitionProvider } from './components/transition';

function App() {
  return (
    <TransitionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/random" element={<Random />} />
        </Routes>
      </Router>
    </TransitionProvider>
  );
}

export default App;
