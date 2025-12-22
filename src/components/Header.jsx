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
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
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
              <span className="text-gray-300">|</span>
              <button 
                onClick={navigateToHome}
                className="px-2 py-1 hover:bg-gray-800 rounded transition"
              >
                <span className="font-semibold hover:text-green-300">Home</span>
              </button>
              <button 
                onClick={navigateToEnrolled}
                className="px-2 py-1 hover:bg-gray-800 rounded transition"
              >
                <span className="font-semibold hover:text-green-300">Enrolled</span>
              </button>
              <button 
                onClick={navigateToTeaching}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-800 rounded transition"
              >
                <span className="font-medium hover:text-green-300">Teaching</span>
              </button>
            </div>
          </div>
          
          {/* Right Section - Logout */}
          <div className="flex items-center">
            <button 
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition mr-2"
              onClick={onJoinClassClick}
            >
              <span className="text-white font-medium">+</span>
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              <span className="text-gray-300">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;