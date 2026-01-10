import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import JoinClassModal from '../components/JoinClassModal';

function Enrolled({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]); // ✅ Should be array
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedTimeline, setSelectedTimeline] = useState('All Due Timeline');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);

  // Load classes and quizzes from localStorage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('joinedClasses');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
    
    // Load ALL quizzes from localStorage (teacher quizzes)
    const loadQuizzes = () => {
      try {
        const teacherQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
        const assignedQuizzes = teacherQuizzes.filter(q => q.status === 'assigned');
        
        console.log('Loaded assigned quizzes:', assignedQuizzes.length);
        setAllQuizzes(assignedQuizzes || []); // ✅ Ensure it's always an array
      } catch (error) {
        console.error('Error loading quizzes:', error);
        setAllQuizzes([]); // ✅ Set to empty array on error
      }
    };
    
    loadQuizzes();
  }, []);

  // ✅ Function to refresh quizzes
  const refreshQuizzes = () => {
    const teacherQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    const assignedQuizzes = teacherQuizzes.filter(q => q.status === 'assigned');
    setAllQuizzes(assignedQuizzes || []);
  };

  // ✅ Check quiz submission status
  const getQuizSubmissionStatus = (quizId) => {
    try {
      const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
      const searchId = quizId?.toString();
      
      // Find matching result
      const result = allResults.find(r => {
        const rQuizId = r.quizId?.toString();
        return (
          rQuizId === searchId ||
          parseInt(rQuizId) === parseInt(searchId)
        );
      });
      
      if (!result) {
        return { submitted: false, released: false };
      }
      
      return {
        submitted: true,
        released: result.scoreReleased || false,
        score: result.score
      };
    } catch (error) {
      console.error('Error checking submission status:', error);
      return { submitted: false, released: false };
    }
  };

  // ✅ Get quizzes ONLY for enrolled classes - FIXED VERSION
  const getQuizzesForEnrolledClasses = () => {
    let quizzes = [];
    
    // Ensure allQuizzes is an array
    if (!Array.isArray(allQuizzes) || !Array.isArray(classes)) {
      console.warn('allQuizzes or classes is not an array:', { allQuizzes, classes });
      return [];
    }
    
    classes.forEach(classItem => {
      // Find quizzes assigned to this class
      const classQuizzes = allQuizzes.filter(quiz => {
        const quizClass = quiz.class || '';
        const className = classItem.name || '';
        
        return (
          quizClass === className ||
          quizClass.toLowerCase().includes(className.toLowerCase()) ||
          className.toLowerCase().includes(quizClass.toLowerCase())
        );
      });
      
      // Add status and due date to each quiz
      const enhancedQuizzes = classQuizzes.map(q => ({
        ...q,
        class: classItem.name,
        due: formatDueDate(q.scheduleDate),
        status: getQuizStatus(q.scheduleDate)
      }));
      
      quizzes = [...quizzes, ...enhancedQuizzes];
    });
    
    return quizzes;
  };

  // ✅ Format due date
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return 'Overdue';
      
      return `${diffDays} days`;
    } catch (error) {
      return 'No due date';
    }
  };

  // ✅ Get quiz status
  const getQuizStatus = (dateString) => {
    if (!dateString) return 'available';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (date < now) return 'missing';
      return 'upcoming';
    } catch (error) {
      return 'available';
    }
  };

  const handleJoinClass = (classCode) => {
    const alreadyEnrolled = classes.some(cls => cls.code === classCode);
    
    if (!alreadyEnrolled) {
      // Find the class in allClasses
      const allClasses = JSON.parse(localStorage.getItem('allClasses') || '[]');
      const classData = allClasses.find(cls => cls.code === classCode);
      
      if (!classData) {
        alert(`Class with code "${classCode}" not found. Please check the code and try again.`);
        return;
      }
      
      const newClass = {
        code: classCode,
        name: classData.name,
        schedule: classData.schedule,
        instructor: classData.instructor,
        description: classData.description || ''
      };
      
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
      
      // Refresh quizzes after joining class
      refreshQuizzes();
      alert(`Successfully joined ${classData.name}!`);
    } else {
      alert(`You are already enrolled in class with code: ${classCode}`);
    }
  };

  const handleRemoveClass = (codeToRemove) => {
    const updatedClasses = classes.filter(cls => cls.code !== codeToRemove);
    setClasses(updatedClasses);
    localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
    
    // Refresh quizzes after removing class
    refreshQuizzes();
  };

  // Get enrolled class names for dropdown
  const enrolledClassNames = ['All Classes', ...classes.map(cls => cls.name)];

  // Filter quizzes based on selected class filter
  const filteredQuizzes = getQuizzesForEnrolledClasses().filter(quiz => {
    if (selectedClass === 'All Classes') return true;
    
    // Find class by name to get code
    const classItem = classes.find(cls => cls.name === selectedClass);
    if (!classItem) return false;
    
    return quiz.class === selectedClass || quiz.class === classItem.name;
  });

  // Filter quizzes based on selected timeline filter
  const finalQuizzes = filteredQuizzes.filter(quiz => {
    if (selectedTimeline === 'All Due Timeline') return true;
    
    const dueText = (quiz.due || '').toLowerCase();
    
    if (selectedTimeline === 'Today' && (dueText.includes('today') || dueText === 'today')) return true;
    if (selectedTimeline === 'Tomorrow' && (dueText.includes('tomorrow') || dueText === 'tomorrow')) return true;
    if (selectedTimeline === 'This Week' && 
        (dueText.includes('today') || 
         dueText.includes('tomorrow') || 
         (dueText.includes('days') && parseInt(dueText.split(' ')[0]) <= 7))) return true;
    if (selectedTimeline === 'Next Week' && 
        dueText.includes('days') && 
        parseInt(dueText.split(' ')[0]) > 7) return true;
    
    return false;
  });

  // Timeline options for dropdown
  const timelineOptions = ['All Due Timeline', 'Today', 'Tomorrow', 'This Week', 'Next Week'];

  // Calculate missing and upcoming quizzes
  const missingQuizzes = getQuizzesForEnrolledClasses().filter(q => q.status === 'missing');
  const upcomingQuizzes = getQuizzesForEnrolledClasses().filter(q => q.status === 'upcoming');
  const submittedQuizzes = getQuizzesForEnrolledClasses().filter(q => 
    getQuizSubmissionStatus(q.id).submitted
  );
  const gradedQuizzes = getQuizzesForEnrolledClasses().filter(q => 
    getQuizSubmissionStatus(q.id).released
  );

 

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        setIsAuthenticated={setIsAuthenticated} 
        onJoinClassClick={() => setShowJoinModal(true)}
      />
      
      <div className="container mx-auto px-4 py-8">
       

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Enrolled Classes</h3>
            <p className="text-4xl font-bold">{classes.length}</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Quizzes</h3>
            <p className="text-4xl font-bold">{getQuizzesForEnrolledClasses().length}</p>
            <button
              onClick={refreshQuizzes}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2"
            >
              Refresh
            </button>
          </div>
          
          <div className="bg-red-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-red-300">Missing</h3>
            <p className="text-4xl font-bold">{missingQuizzes.length}</p>
            <p className="text-sm text-red-300 mt-2">Past due date</p>
          </div>
          
          <div className="bg-green-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-green-300">Submitted</h3>
            <p className="text-4xl font-bold">{submittedQuizzes.length}</p>
            <p className="text-sm text-green-300 mt-2">
              {gradedQuizzes.length} graded
            </p>
          </div>
        </div>

        {/* Top Section - Quizzes taking full width */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-8">
              <div className="flex space-x-4 mb-3">
                <button className="px-6 py-3 bg-blue-900 hover:bg-blue-800 rounded-lg transition">
                  <span className="font-medium text-blue-300">
                    All Quizzes ({getQuizzesForEnrolledClasses().length})
                  </span>
                </button>
                <button className="px-6 py-3 bg-red-900 hover:bg-red-800 rounded-lg transition">
                  <span className="font-medium text-red-300">
                    Missing ({missingQuizzes.length})
                  </span>
                </button>
                <button className="px-6 py-3 bg-green-900 hover:bg-green-800 rounded-lg transition">
                  <span className="font-medium text-green-300">
                    Upcoming ({upcomingQuizzes.length})
                  </span>
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

            {/* Quizzes List */}
            <div className="space-y-6">
              {finalQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {classes.length === 0 
                      ? "Join a class to see quizzes. Click 'Join Class' to get started!" 
                      : "No quizzes available for the selected filters."}
                  </p>
                  <button
                    onClick={refreshQuizzes}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    Refresh Quizzes
                  </button>
                </div>
              ) : (
                finalQuizzes.map((quiz) => {
                  const submissionStatus = getQuizSubmissionStatus(quiz.id);
                  const isOverdue = quiz.status === 'missing';
                  
                  return (
                    <div key={quiz.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">{quiz.title || quiz.name}</h3>
                            {submissionStatus.submitted ? (
                              submissionStatus.released ? (
                                <span className="px-2 py-1 bg-green-900 text-green-300 text-sm font-medium rounded-full">
                                  Score: {submissionStatus.score?.percentage}%
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-sm font-medium rounded-full">
                                  Submitted - Pending
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-1 bg-blue-900 text-blue-300 text-sm font-medium rounded-full">
                                Available
                              </span>
                            )}
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-900 text-red-300 text-sm font-medium rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-gray-400">{quiz.class}</span>
                            {quiz.points && (
                              <span className="text-gray-400">• {quiz.points} points</span>
                            )}
                            {quiz.timerMinutes && (
                              <span className="text-gray-400">• {quiz.timerMinutes} min</span>
                            )}
                            {quiz.topic && (
                              <span className="text-gray-400">• {quiz.topic}</span>
                            )}
                          </div>
                          
                          {quiz.instructions && (
                            <p className="text-gray-500 mb-3 line-clamp-2">{quiz.instructions}</p>
                          )}
                        </div>
                        
                        <div className="text-right ml-4 min-w-[150px]">
                          <p className="text-gray-400 text-sm mb-1">Due</p>
                          <p className={`font-semibold text-lg ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                            {quiz.due}
                          </p>
                          
                          {/* Quiz Action Button */}
                          {submissionStatus.submitted ? (
                            submissionStatus.released ? (
                              <button 
                                onClick={() => navigate(`/quiz/${quiz.id}`, { 
                                  state: { showResults: true } 
                                })}
                                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition w-full"
                              >
                                View Results
                              </button>
                            ) : (
                              <button 
                                onClick={() => navigate(`/quiz/${quiz.id}`, { 
                                  state: { showPending: true } 
                                })}
                                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition w-full"
                              >
                                Submitted
                              </button>
                            )
                          ) : (
                            <button 
                              onClick={() => navigate(`/quiz/${quiz.id}`)}
                              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition w-full"
                            >
                              Take Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
                classes.map((classItem) => {
                  const classQuizzes = getQuizzesForEnrolledClasses().filter(q => q.class === classItem.name);
                  const upcomingClassQuizzes = classQuizzes.filter(q => q.status === 'upcoming');
                  const missingClassQuizzes = classQuizzes.filter(q => q.status === 'missing');
                  
                  return (
                    <div key={classItem.code} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold mb-2">{classItem.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm bg-blue-900 text-blue-300 px-2 py-1 rounded">
                            Code: {classItem.code}
                          </span>
                          {missingClassQuizzes.length > 0 && (
                            <span className="text-sm bg-red-900 text-red-300 px-2 py-1 rounded">
                              {missingClassQuizzes.length} missing
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400">{classItem.schedule}</p>
                        <p className="text-gray-400">{classItem.instructor}</p>
                        {classItem.description && (
                          <p className="text-gray-500 text-sm mt-2">{classItem.description}</p>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Quizzes:</span>
                          <span className="text-gray-300">{classQuizzes.length} total</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400">{upcomingClassQuizzes.length} upcoming</span>
                          <span className="text-red-400">{missingClassQuizzes.length} missing</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => handleRemoveClass(classItem.code)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Leave Class
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedClass(classItem.name);
                            // Scroll to top section
                            document.querySelector('.bg-gray-900.rounded-xl').scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                          <span className="font-medium">View Quizzes</span>
                        </button>
                      </div>
                    </div>
                  );
                })
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