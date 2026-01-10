import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Enrolled from './pages/Enrolled';
import Teaching from './pages/Teaching'; 
import TakeQuiz from './pages/TakeQuiz';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('student'); // Default to student

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUserRole(role || 'student');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={
          isAuthenticated ? 
          <Navigate to="/dashboard" /> : 
          <AuthPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
        } />

        {/* Dashboard - accessible to all authenticated users */}
        <Route path="/dashboard" element={
          isAuthenticated ? 
          <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />
        
        {/* Enrolled - accessible to all authenticated users */}
        <Route path="/enrolled" element={
          isAuthenticated ? 
          <Enrolled setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />

        {/* Teaching - accessible to all authenticated users (or only teachers) */}
        <Route path="/teaching" element={
          isAuthenticated ? 
          <Teaching setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />

        {/* Quiz route */}
        <Route path="/quiz/:quizId" element={
          isAuthenticated ? 
          <TakeQuiz setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;