import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Enrolled from './pages/Enrolled';
import Teaching from './pages/Teaching'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? 
          <Navigate to="/dashboard" /> : 
          <AuthPage setIsAuthenticated={setIsAuthenticated} />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? 
          <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />
        <Route path="/enrolled" element={
          isAuthenticated ? 
          <Enrolled setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />
        <Route path="/teaching" element={
          isAuthenticated ? 
          <Teaching setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
}

export default App;