import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Admin from './pages/Admin';
import Quiz from './pages/Quiz';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;