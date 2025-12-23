// Teaching.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { availableClasses } from '../data/classes';
import CreateClassModal from '../components/CreateClassCodeModal';
import CreateQuizModal from '../components/CreateQuizModal';

function Teaching({ setIsAuthenticated }) {
  const [showJoinModal, setJoinClassModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showCreateQuizModal, setCreateQuizModal] = useState(false);
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
       <h1 className="text-3xl font-bold mb-8">Teaching Dashboard</h1>
        {/* Classes Section */}
        <section aria-labelledby="classes-heading" className="bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="classes-heading" className="text-2xl font-bold">Your Classes</h2>
            <button
              onClick={() => setShowCreateClassModal(true)}
              aria-label="Join a new class"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-xl" aria-hidden="true">+</span>
              <span>Create Class</span>
            </button>
          </div>
          
          
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No classes created yet.</p>
              <button
                onClick={() => setShowCreateClassModal(true)}
                aria-label="Join your first class"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="text-2xl" aria-hidden="true">+</span>
                <span>Create your first class</span>
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

        {/* Add Quizzes Section */}
        <section aria-labelledby="quizzes-heading" className="bg-gray-900 rounded-xl p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 id="quizzes-heading" className="text-2xl font-bold">Quizzes</h2>
            <button
              onClick={() => setShowCreateQuizModal(true)}
              aria-label="Add a new quiz"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-xl" aria-hidden="true">+</span>
              <span>Add Quiz</span>
            </button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No quizzes created yet.</p>
            <button
              onClick={() => setShowCreateQuizModal(true)}
              aria-label="Create your first quiz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-2xl" aria-hidden="true">+</span>
              <span>Create your first quiz</span>
            </button>
          </div>
        </section>
      </main>

      {/* Create Class Modal */}
      <CreateClassModal 
        show={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        onJoin={handleJoinClass}
      />
      {/* Create Quiz Modal */}
      <CreateQuizModal
        show={showCreateQuizModal}
        onClose={() => setShowCreateQuizModal(false)}
      />
    </div>
  );
}

export default Teaching;