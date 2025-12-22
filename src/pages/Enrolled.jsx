// Enrolled.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import JoinClassModal from '../components/JoinClassModal';
import { availableClasses, classQuizzes, getQuizzesForClasses } from '../data/classes';

function Enrolled({ setIsAuthenticated }) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedTimeline, setSelectedTimeline] = useState('All Due Timeline');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);

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

  // Get quizzes ONLY for enrolled classes
  const getQuizzesForEnrolledClasses = () => {
    let quizzes = [];
    
    classes.forEach(classItem => {
      if (classQuizzes[classItem.code]) {
        quizzes = [...quizzes, ...classQuizzes[classItem.code]];
      }
    });
    
    return quizzes;
  };

  // Get enrolled class names for dropdown (only shows enrolled classes + "All Classes")
  const enrolledClassNames = ['All Classes', ...classes.map(cls => cls.name)];

  // Filter quizzes based on selected class filter
  const filteredQuizzes = getQuizzesForEnrolledClasses().filter(quiz => {
    if (selectedClass === 'All Classes') return true;
    
    // Extract class identifier (e.g., "COSC 101" -> "COSC-101")
    const quizClassCode = quiz.class.replace(' ', '').toUpperCase();
    const selectedClassCode = selectedClass.replace(' - ', '').replace(' ', '').toUpperCase();
    
    return quizClassCode.includes(selectedClassCode) || selectedClassCode.includes(quizClassCode);
  });

  // Filter quizzes based on selected timeline filter
  const finalQuizzes = filteredQuizzes.filter(quiz => {
    if (selectedTimeline === 'All Due Timeline') return true;
    if (selectedTimeline === 'Today' && quiz.due.includes('Today')) return true;
    if (selectedTimeline === 'Tomorrow' && quiz.due.includes('Tomorrow')) return true;
    if (selectedTimeline === 'This Week' && 
        (quiz.due.includes('Today') || quiz.due.includes('Tomorrow') || quiz.due.includes('Thursday'))) return true;
    if (selectedTimeline === 'Next Week' && quiz.due.includes('Next Week')) return true;
    return false;
  });

  // Timeline options for dropdown
  const timelineOptions = ['All Due Timeline', 'Today', 'Tomorrow', 'This Week', 'Next Week'];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        setIsAuthenticated={setIsAuthenticated} 
        onJoinClassClick={() => setShowJoinModal(true)}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Top Section - Quizzes taking full width */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-8">
              <div className="flex space-x-4 mb-3">
                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                  <span className="font-medium">Assigned</span>
                </button>
                <button className="px-6 py-3 bg-red-900 hover:bg-red-800 rounded-lg transition">
                  <span className="font-medium text-red-300">Missing</span>
                </button>
                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                  <span className="font-medium">Done</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              {/* All Classes Dropdown - Only shows enrolled classes */}
              <div className="relative">
                <button
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                  <span className="font-medium">{selectedClass}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showClassDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[200px]">
                    {enrolledClassNames.map((className, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedClass(className);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${index === 0 ? 'rounded-t-lg' : ''} ${index === enrolledClassNames.length - 1 ? 'rounded-b-lg' : ''} ${selectedClass === className ? 'bg-gray-700' : ''}`}
                      >
                        {className}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* All Due Timeline Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTimelineDropdown(!showTimelineDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                  <span className="font-medium">{selectedTimeline}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTimelineDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                    {timelineOptions.map((timeline, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedTimeline(timeline);
                          setShowTimelineDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${index === 0 ? 'rounded-t-lg' : ''} ${index === timelineOptions.length - 1 ? 'rounded-b-lg' : ''} ${selectedTimeline === timeline ? 'bg-gray-700' : ''}`}
                      >
                        {timeline}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes List - Only shows quizzes for enrolled classes */}
            <div className="space-y-6">
              {finalQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {classes.length === 0 
                      ? "Join a class to see quizzes." 
                      : "No quizzes available for the selected filters."}
                  </p>
                </div>
              ) : (
                finalQuizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold mb-3">{quiz.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-lg">{quiz.class}</span>
                          {quiz.status === "missing" && (
                            <span className="px-4 py-1 bg-red-900 text-red-300 text-sm font-medium rounded-full">
                              Missing
                            </span>
                          )}
                          {quiz.status === "upcoming" && (
                            <span className="px-4 py-1 bg-yellow-900 text-yellow-300 text-sm font-medium rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Due</p>
                        <p className="font-semibold text-lg">{quiz.due}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Your Classes (full width) */}
        <div>
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Your Classes</h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">+</span>
                <span>Join Class</span>
              </button>
            </div>
            
            {/* Classes Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't joined any classes yet.</p>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition"
                  >
                    <span className="text-2xl">+</span>
                    <span>Join Your First Class</span>
                  </button>
                </div>
              ) : (
                classes.map((classItem) => (
                  <div key={classItem.code} className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-3">{classItem.name}</h3>
                    <p className="text-gray-400 text-lg mb-2">{classItem.schedule}</p>
                    <p className="text-gray-400 text-lg mb-6">{classItem.instructor}</p>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleRemoveClass(classItem.code)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Leave Class
                      </button>
                      <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                        <span className="font-medium">View Class</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Use the shared JoinClassModal */}
      <JoinClassModal 
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}

export default Enrolled;