import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import JoinClassModal from '../components/JoinClassModal';
import { getSharedClasses, getClassByCode } from '../utils/sharedClasses';
import { getStudentStats, getStudentQuizResult } from '../utils/quizGrading';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classQuizzes, setClassQuizzes] = useState({});
  const [allQuizzes, setAllQuizzes] = useState([]); // ✅ NEW: Store all quizzes
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeClasses: 0,
    averageScore: 0,
    missingQuizzes: 0,
    gradedQuizzes: 0,
    totalPoints: 0
  });

  // Load classes and quizzes from localStorage
  useEffect(() => {
    // 1. Load enrolled classes
    const savedClasses = localStorage.getItem('joinedClasses');
    if (savedClasses) {
      const enrolledClasses = JSON.parse(savedClasses);
      setClasses(enrolledClasses);
    }
    
    // 2. Load ALL quizzes from localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    setAllQuizzes(savedQuizzes); // ✅ Store all quizzes
    
    // 3. Calculate statistics
    if (savedClasses) {
      const enrolledClasses = JSON.parse(savedClasses);
      calculateStatistics(enrolledClasses, savedQuizzes);
    }
    
    // 4. Update stats from quiz results
    const studentStats = getStudentStats();
    setStats(prev => ({
      ...prev,
      averageScore: studentStats.averageScore,
      gradedQuizzes: studentStats.gradedQuizzes,
      totalPoints: studentStats.totalPoints
    }));
  }, []);

  // Calculate statistics - FIXED VERSION
  const calculateStatistics = (enrolledClasses, teacherQuizzes) => {
    // Get only assigned quizzes (not drafts)
    const assignedQuizzes = teacherQuizzes.filter(quiz => quiz.status === 'assigned');
    
    let totalQuizzes = 0;
    let missingQuizzes = 0;
    const quizzesByClass = {};
    
    enrolledClasses.forEach(classItem => {
      // Find quizzes for this class - IMPROVED MATCHING
      const classQuizList = assignedQuizzes.filter(quiz => {
        // Multiple ways to match class
        const quizClass = quiz.class || '';
        const className = classItem.name || '';
        
        return (
          quizClass === className ||
          quizClass.toLowerCase().includes(className.toLowerCase()) ||
          className.toLowerCase().includes(quizClass.toLowerCase()) ||
          quizClass.replace(/\s+/g, '') === className.replace(/\s+/g, '')
        );
      });
      
      totalQuizzes += classQuizList.length;
      
      // Calculate missing quizzes (past due date)
      const missing = classQuizList.filter(quiz => {
        if (quiz.scheduleDate) {
          const dueDate = new Date(quiz.scheduleDate);
          const today = new Date();
          return dueDate < today;
        }
        return false;
      });
      
      missingQuizzes += missing.length;
      quizzesByClass[classItem.code] = classQuizList;
    });
    
    setClassQuizzes(quizzesByClass);
    setStats(prev => ({
      ...prev,
      totalQuizzes: totalQuizzes,
      activeClasses: enrolledClasses.length,
      missingQuizzes: missingQuizzes
    }));
  };

  // ✅ NEW: Function to refresh quizzes from localStorage
  const refreshQuizzes = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    setAllQuizzes(savedQuizzes);
    
    if (classes.length > 0) {
      calculateStatistics(classes, savedQuizzes);
    }
  };

  const handleJoinClass = (classCode) => {
    const alreadyEnrolled = classes.some(cls => cls.code === classCode.toUpperCase());

    if (!alreadyEnrolled) {
      const classData = getClassByCode(classCode);
      
      if (!classData) {
        alert(`Class with code "${classCode}" not found. Please check the code and try again.`);
        return;
      }
      
      const newClass = {
        code: classCode.toUpperCase(),
        name: classData.name,
        schedule: classData.schedule,
        instructor: classData.instructor,
        description: classData.description || ''
      };

      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
      
      // ✅ Refresh quizzes after joining class
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
    
    // ✅ Refresh quizzes after removing class
    refreshQuizzes();
  };

  // Get quizzes for a specific class - FIXED VERSION
  const getQuizzesForClass = (classCode) => {
    const classItem = classes.find(c => c.code === classCode);
    if (!classItem) return [];
    
    // Get assigned quizzes
    const assignedQuizzes = allQuizzes.filter(quiz => quiz.status === 'assigned');
    
    // Match quizzes to class
    return assignedQuizzes.filter(quiz => {
      const quizClass = quiz.class || '';
      const className = classItem.name || '';
      
      return (
        quizClass === className ||
        quizClass.toLowerCase().includes(className.toLowerCase()) ||
        className.toLowerCase().includes(quizClass.toLowerCase())
      );
    });
  };

  // Get quiz submission status
 const getQuizSubmissionStatus = (quizId) => {
  try {
    const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    const searchId = quizId?.toString();
    
    console.log('Checking submission status for quiz ID:', quizId, 'Type:', typeof quizId);
    console.log('Searching for:', searchId);
    
    // Find matching result
    const result = allResults.find(r => {
      const rQuizId = r.quizId?.toString();
      return (
        rQuizId === searchId ||                    // String match
        parseInt(rQuizId) === parseInt(searchId) || // Number match
        r.quizId === quizId                         // Direct match
      );
    });
    
    console.log('Found result:', result);
    
    if (!result) {
      console.log('No submission found for quiz:', quizId);
      return { submitted: false, released: false };
    }
    
    console.log('Student has taken this quiz. Released:', result.scoreReleased);
    return {
      submitted: true,
      released: result.scoreReleased || false,
      score: result.score,
      studentResult: result 
    };
  } catch (error) {
    console.error('Error checking submission status:', error);
    return { submitted: false, released: false };
  }
};

  // Format date for display
  const formatDate = (dateString) => {
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
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        setIsAuthenticated={setIsAuthenticated}
        onJoinClassClick={() => setShowJoinModal(true)}
      />

      <div className="container mx-auto px-4 py-8">


        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Active Classes</h3>
            <p className="text-4xl font-bold">{stats.activeClasses}</p>
            <p className="text-sm text-gray-400 mt-2">Classes enrolled</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Available Quizzes</h3>
            <p className="text-4xl font-bold">{stats.totalQuizzes}</p>
            <button
              onClick={refreshQuizzes}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2"
              title="Refresh quizzes"
            >
            </button>
          </div>

          <div className="bg-orange-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-orange-300">Average Score</h3>
            <p className="text-4xl font-bold">{stats.averageScore}%</p>
            <p className="text-sm text-orange-300 mt-2">{stats.gradedQuizzes} quizzes graded</p>
          </div>

          <div className="bg-red-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-red-300">Missing</h3>
            <p className="text-4xl font-bold">{stats.missingQuizzes}</p>
            <p className="text-sm text-red-300 mt-2">Past due date</p>
          </div>
        </div>

        {/* ================= YOUR CLASSES ================= */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedClass ? 'Class Overview' : 'Your Classes'}
            </h2>

            {!selectedClass && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">+</span>
                <span>Join Class</span>
              </button>
            )}
          </div>

          {/* ========== CLASS DETAIL VIEW ========== */}
          {selectedClass ? (
            <div>
              {/* Back button */}
              <button
                onClick={() => setSelectedClass(null)}
                className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Classes
              </button>

              {/* Class banner */}
              <div className="bg-orange-600 text-black rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedClass.name}
                    </h2>
                    <p className="mt-1">Code: {selectedClass.code}</p>
                    <p className="mt-1">{selectedClass.instructor}</p>
                    <p className="mt-1">{selectedClass.schedule}</p>
                    {selectedClass.description && (
                      <p className="mt-2 text-sm opacity-90">{selectedClass.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Available Quizzes</p>
                    <p className="text-3xl font-bold">{getQuizzesForClass(selectedClass.code).length}</p>
                  </div>
                </div>
              </div>

              {/* Quiz list */}
              <div className="space-y-4">
                {getQuizzesForClass(selectedClass.code).length === 0 ? (
                  <div className="text-center py-8 border border-gray-700 rounded-lg">
                    <p className="text-gray-400">No quizzes available for this class yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later or ask your instructor</p>
                    <button
                      onClick={refreshQuizzes}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Refresh Quizzes
                    </button>
                  </div>
                ) : (
                  getQuizzesForClass(selectedClass.code).map((quiz, index) => {
                    const isOverdue = quiz.scheduleDate && new Date(quiz.scheduleDate) < new Date();
                    const submissionStatus = getQuizSubmissionStatus(quiz.id);
                    
                    return (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 flex justify-between items-center ${isOverdue ? 'border-red-700 bg-red-900/20' : 'border-gray-700'}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-lg">{quiz.title}</p>
                            {submissionStatus.submitted ? (
                              submissionStatus.released ? (
                                <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-medium rounded">
                                  Score: {submissionStatus.score?.percentage}%
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-medium rounded">
                                  Submitted - Pending Review
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs font-medium rounded">
                                Available
                              </span>
                            )}
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            {quiz.points && (
                              <span>{quiz.points} points</span>
                            )}
                            {quiz.timerMinutes && (
                              <span>• {quiz.timerMinutes} minutes</span>
                            )}
                            {quiz.topic && (
                              <span>• {quiz.topic}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-gray-400 text-sm">Due</p>
                          <p className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                            {formatDate(quiz.scheduleDate)}
                          </p>
                          {submissionStatus.submitted ? (
                            <button 
                              onClick={() => {
                                if (submissionStatus.released) {
                                  navigate(`/quiz/${quiz.id}`, { 
                                    state: { 
                                      quiz,
                                      showResults: true 
                                    } 
                                  });
                                } else {
                                  alert('Your quiz is submitted. Scores will be released after instructor review.');
                                }
                              }}
                              className="mt-2 px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
                            >
                              {submissionStatus.released ? 'View Results' : 'Pending Review'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/quiz/${quiz.id}`, { state: { quiz } })}
                              className="mt-2 px-4 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition"
                            >
                              Take Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : classes.length === 0 ? (
            /* ========== EMPTY STATE ========== */
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No Classes Yet</h3>
                <p className="text-gray-400 mb-4">
                  Join your first class to see quizzes and assignments
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition"
                >
                  <span className="text-2xl">+</span>
                  <span>Join Your First Class</span>
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Ask your instructor for a class code to get started
                </p>
              </div>
            </div>
          ) : (
            /* ========== CLASS GRID ========== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem, index) => {
                const classQuizzesList = getQuizzesForClass(classItem.code);
                const upcomingQuizzes = classQuizzesList.filter(quiz => 
                  !quiz.scheduleDate || new Date(quiz.scheduleDate) >= new Date()
                );
                const missingQuizzes = classQuizzesList.filter(quiz => 
                  quiz.scheduleDate && new Date(quiz.scheduleDate) < new Date()
                );
                const submittedQuizzes = classQuizzesList.filter(quiz => {
                  const status = getQuizSubmissionStatus(quiz.id);
                  return status.submitted;
                });
                const gradedQuizzes = classQuizzesList.filter(quiz => {
                  const status = getQuizSubmissionStatus(quiz.id);
                  return status.released;
                });
                
                return (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition cursor-pointer"
                    onClick={() => setSelectedClass(classItem)}
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">
                          {classItem.name}
                        </h3>
                        <div className="flex gap-1">
                          {missingQuizzes.length > 0 && (
                            <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-medium rounded">
                              {missingQuizzes.length} missing
                            </span>
                          )}
                          {gradedQuizzes.length > 0 && (
                            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-medium rounded">
                              {gradedQuizzes.length} graded
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {classItem.schedule}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {classItem.instructor}
                        </p>
                      </div>
                      
                      <div className="text-sm text-orange-400 font-medium mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Code: {classItem.code}
                      </div>
                      
                      {classItem.description && (
                        <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                          {classItem.description}
                        </p>
                      )}
                      
                      {/* Class Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold">{classQuizzesList.length}</div>
                            <div className="text-gray-500">Quizzes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{submittedQuizzes.length}</div>
                            <div className="text-gray-500">Submitted</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{gradedQuizzes.length}</div>
                            <div className="text-gray-500">Graded</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClass(classItem.code);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Leave Class
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(classItem);
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
                      >
                        <span>View Class</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Join Class Modal */}
      <JoinClassModal
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}

export default Dashboard;