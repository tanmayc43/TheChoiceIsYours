import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Random from './pages/Random';
import Recommend from './pages/Recommend'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/random" element={<Random />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
