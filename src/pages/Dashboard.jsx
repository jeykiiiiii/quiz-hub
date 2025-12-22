// Dashboard.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import JoinClassModal from '../components/JoinClassModal';
import { availableClasses } from '../data/classes';

function Dashboard({ setIsAuthenticated }) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classes, setClasses] = useState([]);

  // Load classes from localStorage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('joinedClasses');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
  }, []);

  const handleJoinClass = (classCode) => {
    const alreadyEnrolled = classes.some(cls => cls.code === classCode);
    
    if (!alreadyEnrolled) {
      const classData = availableClasses[classCode];
      const newClass = {
        code: classCode,
        name: classData.name,
        schedule: classData.schedule,
        instructor: classData.instructor
      };
      
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
    } else {
      alert(`You are already enrolled in class with code: ${classCode}`);
    }
  };

  const handleRemoveClass = (codeToRemove) => {
    const updatedClasses = classes.filter(cls => cls.code !== codeToRemove);
    setClasses(updatedClasses);
    localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        setIsAuthenticated={setIsAuthenticated} 
        onJoinClassClick={() => setShowJoinModal(true)}
      />
      
      <main className="container mx-auto px-4 py-8" role="main">
        
        {/* Stats Cards */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Dashboard Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Quizzes */}
            <div className="bg-gray-900 rounded-xl p-6" role="region" aria-label="Total Quizzes">
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Quizzes</h3>
              <p className="text-4xl font-bold" aria-live="polite">0</p>
            </div>
            
            {/* Active Classes */}
            <div className="bg-gray-900 rounded-xl p-6" role="region" aria-label="Active Classes Count">
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Active Classes</h3>
              <p className="text-4xl font-bold" aria-live="polite">{classes.length}</p>
            </div>
            
            {/* Average Score */}
            <div className="bg-gray-900 rounded-xl p-6" role="region" aria-label="Average Score">
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Average Score</h3>
              <p className="text-4xl font-bold" aria-live="polite">0</p>
            </div>
          </div>
        </section>

        {/* Classes Section */}
        <section aria-labelledby="classes-heading" className="bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="classes-heading" className="text-2xl font-bold">Your Classes</h2>
            <button
              onClick={() => setShowJoinModal(true)}
              aria-label="Join a new class"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-xl" aria-hidden="true">+</span>
              <span>Join Class</span>
            </button>
          </div>
          
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't joined any classes yet.</p>
              <button
                onClick={() => setShowJoinModal(true)}
                aria-label="Join your first class"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="text-2xl" aria-hidden="true">+</span>
                <span>Join Your First Class</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
              {classes.map((classItem, index) => (
                <article 
                  key={index} 
                  className="bg-gray-800 rounded-xl p-6 relative group focus-within:ring-2 focus-within:ring-orange-500"
                  role="listitem"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">{classItem.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <span aria-label="Schedule">{classItem.schedule}</span>
                    </div>
                    <p className="text-gray-400 mb-2">
                      <span className="sr-only">Instructor: </span>
                      {classItem.instructor}
                    </p>
                    <div className="text-sm text-orange-400 font-medium">
                      <span className="sr-only">Class Code: </span>
                      {classItem.code}
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <button 
                      onClick={() => handleRemoveClass(classItem.code)}
                      aria-label={`Leave ${classItem.name} class`}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    >
                      Leave Class
                    </button>
                    <button 
                      aria-label={`View ${classItem.name} class details`}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      View Class
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Use the shared JoinClassModal */}
      <JoinClassModal 
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}

export default Dashboard;