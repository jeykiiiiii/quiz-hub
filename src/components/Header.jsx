import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ setIsAuthenticated, onJoinClassClick }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  const navigateToHome = () => {
    navigate('/dashboard');
  };

  const navigateToEnrolled = () => {
    navigate('/enrolled');
  };

  // Teaching page navigation if you have one
  const navigateToTeaching = () => {
    navigate('/teaching');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <nav className="container mx-auto px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">Quiz</span>
              <div className="inline-flex items-center justify-center px-2 py-1 bg-orange-500 rounded-md">
                <span className="font-bold text-black">hub</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-300" aria-hidden="true">|</span>
              <button 
                onClick={navigateToHome}
                className="px-2 py-1 hover:bg-gray-800 rounded transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Home page"
              >
                <span className="font-semibold hover:text-green-300">Home</span>
              </button>
              <button 
                onClick={navigateToEnrolled}
                className="px-2 py-1 hover:bg-gray-800 rounded transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Enrolled classes page"
              >
                <span className="font-semibold hover:text-green-300">Enrolled</span>
              </button>
              <button 
                onClick={navigateToTeaching}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-800 rounded transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Teaching page"
              >
                <span className="font-medium hover:text-green-300">Teaching</span>
              </button>
            </div>
          </div>
          
          {/* Right Section - Logout */}
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
              onClick={onJoinClassClick}
              aria-label="Join a class"
            >
              <span className="text-white font-medium">+</span>
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Logout from your account"
            >
              <span className="text-gray-300">Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;