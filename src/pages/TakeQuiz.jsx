import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function TakeQuiz({ setIsAuthenticated }) {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [hasAlreadyTaken, setHasAlreadyTaken] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  
  const timerRef = useRef(null);
  const lastFocusTimeRef = useRef(Date.now());

  useEffect(() => {
    const checkIfTaken = () => {
      try {
        const studentEmail = localStorage.getItem('studentEmail') || 'anonymous@example.com';
        const studentResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
        
        const searchId = quizId.toString();
        
        const previous = studentResults.find(r => {
          const rQuizId = r.quizId ? r.quizId.toString() : '';
          return rQuizId === searchId && r.studentEmail === studentEmail;
        });
        
        if (previous) {
          console.log('Student has already taken this quiz:', previous);
          setHasAlreadyTaken(true);
          setPreviousResult(previous);
          setScore(previous.score);
          setAnswers(previous.studentAnswers || {});
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Error checking if quiz was taken:', error);
      }
    };
    
    checkIfTaken();
  }, [quizId]);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = () => {
      console.log('Loading quiz with ID:', quizId);
      
      let foundQuiz = null;
      
      // Check multiple sources
      const teacherQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
      const assignedQuizzes = JSON.parse(localStorage.getItem('assignedQuizzes') || '[]');
      
      // Combine and search
      const allQuizzes = [...teacherQuizzes, ...assignedQuizzes];
      const searchId = quizId.toString();
      
      foundQuiz = allQuizzes.find(q => {
        if (!q || !q.id) return false;
        const qId = q.id.toString();
        return qId === searchId;
      });
      
      if (foundQuiz) {
        console.log('Quiz loaded:', foundQuiz);
        setQuiz(foundQuiz);
      } else {
        console.error('Quiz not found. ID:', quizId);
      }
      
      setIsLoading(false);
    };
    
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!isQuizStarted || isSubmitted) return;

    let switchCount = tabSwitchCount;
    let lastSwitchTime = 0;
    const MIN_SWITCH_INTERVAL = 500; 
    let isAutoSubmitted = false;

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        const now = Date.now();
        
        if (now - lastSwitchTime > MIN_SWITCH_INTERVAL) {
          const newCount = switchCount + 1;
          switchCount = newCount;
          setTabSwitchCount(newCount);
          
          console.log(`Tab switch detected! Count: ${newCount}/3`);
          
          if (newCount >= 3 && !isAutoSubmitted) {
            isAutoSubmitted = true;
            alert('⚠️ Maximum tab switches reached! Quiz will be auto-submitted.');
            handleAutoSubmit();
          } else if (newCount < 3) {
            // Show warning
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
          }
          
          lastSwitchTime = now;
        }
      }
    };

    // Track window focus/blur (for switching between windows)
    const handleBlur = () => {
      // Don't count if it's just clicking on browser UI
      setTimeout(() => {
        if (!document.hasFocus() && document.visibilityState === 'visible') {
          const now = Date.now();
          
          if (now - lastSwitchTime > MIN_SWITCH_INTERVAL) {
            const newCount = switchCount + 1;
            switchCount = newCount;
            setTabSwitchCount(newCount);
            
            console.log(`Window blur detected! Count: ${newCount}/3`);
            
            if (newCount >= 3 && !isAutoSubmitted) {
              isAutoSubmitted = true;
              alert('⚠️ Maximum tab/window switches reached! Quiz will be auto-submitted.');
              handleAutoSubmit();
            } else if (newCount < 3) {
              setShowWarning(true);
              setTimeout(() => setShowWarning(false), 3000);
            }
            
            lastSwitchTime = now;
          }
        }
      }, 100); // Small delay to check if focus returns
    };

    const handleFocus = () => {
      lastFocusTimeRef.current = Date.now();
    };

    // Add mouse leave detection for extra strictness
    const handleMouseLeave = (e) => {
      // Only count if mouse leaves through the top of the window
      if (e.clientY <= 0 && document.hasFocus()) {
        const now = Date.now();
        
        if (now - lastSwitchTime > MIN_SWITCH_INTERVAL) {
          const newCount = switchCount + 1;
          switchCount = newCount;
          setTabSwitchCount(newCount);
          
          console.log(`Mouse leave detected! Count: ${newCount}/3`);
          
          if (newCount >= 3 && !isAutoSubmitted) {
            isAutoSubmitted = true;
            alert('⚠️ Mouse left window! Quiz will be auto-submitted.');
            handleAutoSubmit();
          } else if (newCount < 3) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 2000);
          }
          
          lastSwitchTime = now;
        }
      }
    };

    // Add keydown detection for Alt+Tab, Windows key, etc.
    const handleKeyDown = (e) => {
      // Detect Alt+Tab, Windows key, Cmd+Tab (Mac)
      if (
        (e.altKey && e.key === 'Tab') || 
        e.key === 'Meta' || 
        (e.metaKey && e.key === 'Tab')
      ) {
        const now = Date.now();
        
        if (now - lastSwitchTime > MIN_SWITCH_INTERVAL) {
          const newCount = switchCount + 1;
          switchCount = newCount;
          setTabSwitchCount(newCount);
          
          console.log(`Tab switching key detected! Count: ${newCount}/3`);
          
          if (newCount >= 3 && !isAutoSubmitted) {
            isAutoSubmitted = true;
            alert('⚠️ Tab switching keys detected! Quiz will be auto-submitted.');
            handleAutoSubmit();
          } else if (newCount < 3) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 2000);
          }
          
          lastSwitchTime = now;
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('keydown', handleKeyDown);

    // Clean up event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuizStarted, isSubmitted, tabSwitchCount]);

  // Timer
  useEffect(() => {
    if (isTimerStarted && timeLeft > 0 && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerStarted, isSubmitted]);

  // Calculate score
  const calculateScore = () => {
    if (!quiz || !quiz.questions) return null;
    
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answerKey) {
        correctAnswers++;
      }
    });
    
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const pointsPerQuestion = quiz.points && totalQuestions > 0 ? quiz.points / totalQuestions : 0;
    const totalPoints = correctAnswers * pointsPerQuestion;
    
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: Math.round(percentage),
      points: Math.round(totalPoints),
      maxPoints: quiz.points || 0,
      violations: tabSwitchCount
    };
  };

  // SAVE FUNCTION
  const saveQuizResult = (quizScore) => {
    console.log('=== SAVING QUIZ RESULT ===');
    
    if (!quiz || !quizScore) {
      console.error('Cannot save: Missing quiz or score');
      return false;
    }
    
    const studentEmail = localStorage.getItem('studentEmail') || 'anonymous@example.com';
    const studentName = localStorage.getItem('studentName') || 'Anonymous Student';
    
    const result = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      class: quiz.class || 'Unknown Class',
      classCode: quiz.classCode || '',
      studentAnswers: { ...answers },
      score: quizScore,
      submittedAt: new Date().toISOString(),
      timeTaken: quiz.timerMinutes ? (quiz.timerMinutes * 60) - (timeLeft || 0) : 0,
      violations: tabSwitchCount,
      autoSubmitted: tabSwitchCount >= 3 || (timeLeft !== null && timeLeft <= 0),
      scoreReleased: false,
      studentName: studentName,
      studentEmail: studentEmail
    };
    
    console.log('Result to save:', result);
    
    try {
      // Get existing results
      const storageKey = 'studentQuizResults';
      const existingData = localStorage.getItem(storageKey);
      let studentResults = [];
      
      if (existingData) {
        studentResults = JSON.parse(existingData);
      }
      
      console.log('Existing results before save:', studentResults.length);
      
      // Remove any previous submission for this student for this quiz
      const updatedResults = studentResults.filter(r => 
        !(r.quizId === quiz.id && r.studentEmail === studentEmail)
      );
      
      // Add new result
      updatedResults.push(result);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedResults));
      
      console.log('Results after save:', updatedResults.length);
      console.log('=== SAVE SUCCESSFUL ===');
      
      // Also save to completed quizzes
      const completedKey = 'completedQuizzes';
      const completedData = localStorage.getItem(completedKey);
      let completedQuizzes = [];
      
      if (completedData) {
        completedQuizzes = JSON.parse(completedData);
      }
      
      const quizIdStr = quiz.id.toString();
      if (!completedQuizzes.includes(quizIdStr)) {
        completedQuizzes.push(quizIdStr);
        localStorage.setItem(completedKey, JSON.stringify(completedQuizzes));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return false;
    }
  };

  // Start quiz
  const startQuiz = () => {
    if (!quiz) {
      alert('Quiz data not loaded.');
      return;
    }
    
    if (hasAlreadyTaken) {
      alert('You have already taken this quiz. Check your results.');
      return;
    }
    
    const initialTime = quiz.timerMinutes ? quiz.timerMinutes * 60 : 3600;
    setTimeLeft(initialTime);
    setIsTimerStarted(true);
    setIsQuizStarted(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  // Submit quiz
  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your quiz?')) {
      // Calculate score
      const quizScore = calculateScore();
      if (!quizScore) {
        alert('Error calculating score.');
        return;
      }
      
      console.log('Submitting quiz with score:', quizScore);
      
      // Save result
      const saved = saveQuizResult(quizScore);
      
      if (saved) {
        // Update state
        setScore(quizScore);
        setIsSubmitted(true);
        setIsTimerStarted(false);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        alert('Quiz submitted successfully!');
      } else {
        alert('Error saving quiz results. Please try again.');
      }
    }
  };

  // Auto-submit
  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    
    console.log('Auto-submitting quiz...');
    
    const quizScore = calculateScore();
    if (!quizScore) {
      setIsSubmitted(true);
      return;
    }
    
    const saved = saveQuizResult(quizScore);
    
    if (saved) {
      setScore(quizScore);
      setIsSubmitted(true);
      setIsTimerStarted(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      alert('Quiz auto-submitted due to time limit or violations.');
    }
  };

  // Close warning
  const closeWarning = () => {
    setShowWarning(false);
  };

  // Check if scores are released
  const checkScoresReleased = () => {
    const studentEmail = localStorage.getItem('studentEmail') || 'anonymous@example.com';
    const studentResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    
    const myResult = studentResults.find(r => {
      const rQuizId = r.quizId ? r.quizId.toString() : '';
      const thisQuizId = quiz?.id?.toString() || '';
      return rQuizId === thisQuizId && r.studentEmail === studentEmail;
    });
    
    return myResult?.scoreReleased || false;
  };

  // Format time
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Navigation
  const handleNextQuestion = () => {
    if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Render loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Quiz not found
  if (!quiz) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
          <p className="text-gray-400 mb-6">The quiz you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If already taken, show results
  if (hasAlreadyTaken && previousResult) {
    const scoresReleased = previousResult.scoreReleased;
    
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto p-4 max-w-4xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-gray-900 rounded-xl p-8 mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Quiz Already Taken</h1>
            <p className="text-gray-400 text-xl mb-6">{quiz.title}</p>
            
            {scoresReleased ? (
              <div>
                <div className="text-6xl font-bold mb-2">{previousResult.score.percentage}%</div>
                <p className="text-green-400 mb-6">Scores have been released</p>
              </div>
            ) : (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-blue-300">Results Pending</h3>
                <p className="text-gray-300">
                  You have already taken this quiz. The instructor is reviewing your answers.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-gray-400">Submitted on: {new Date(previousResult.submittedAt).toLocaleDateString()}</p>
              <p className="text-gray-400">Time taken: {Math.round(previousResult.timeTaken / 60)} minutes</p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!isQuizStarted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto p-4 max-w-4xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
            <p className="text-gray-400 text-xl mb-6">{quiz.class}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Questions</div>
                <div className="text-2xl font-bold">{quiz.questions?.length || 0}</div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Time Limit</div>
                <div className="text-2xl font-bold">
                  {quiz.timerMinutes ? `${quiz.timerMinutes} minutes` : 'No limit'}
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Points</div>
                <div className="text-2xl font-bold">{quiz.points || 'Unmarked'}</div>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-xl font-bold transition"
            >
              Start Quiz
            </button>
            
            
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (!isSubmitted) {
    const currentQ = quiz.questions?.[currentQuestion];
    const totalQuestions = quiz.questions?.length || 0;
    const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

    return (
      <div className="min-h-screen bg-black text-white">
        {showWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">⚠️ Warning: Tab/Window Switch Detected</h3>
              <p className="mb-2">You navigated away from the quiz window.</p>
              <div className="mb-4 p-3 bg-yellow-800/50 rounded-lg">
                <p className="font-bold text-lg text-center">
                  Violations: {tabSwitchCount}/3
                </p>
                {tabSwitchCount >= 2 && (
                  <p className="text-red-300 text-sm text-center mt-2">
                    ⚠️ One more violation will auto-submit your quiz!
                  </p>
                )}
              </div>
              <p className="text-sm text-yellow-200 mb-4">
                For a fair assessment, please remain on this tab until you complete the quiz.
              </p>
              <button
                onClick={closeWarning}
                className="w-full py-3 bg-yellow-700 hover:bg-yellow-800 rounded-lg font-medium transition"
              >
                I Understand - Continue Quiz
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-gray-400">{quiz.class}</p>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-gray-400">Time Remaining</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    tabSwitchCount >= 3 ? 'text-red-500' : 
                    tabSwitchCount >= 2 ? 'text-red-400' : 
                    tabSwitchCount >= 1 ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {tabSwitchCount}/3
                  </div>
                  <div className="text-sm text-gray-400">Tab Switches</div>
                </div>
              </div>
            </div>
            
            {/* Violation warning bar */}
            {tabSwitchCount > 0 && (
              <div className={`mt-2 p-2 rounded text-sm font-medium ${
                tabSwitchCount >= 3 ? 'bg-red-900/50 text-red-300' :
                tabSwitchCount >= 2 ? 'bg-red-900/30 text-red-300' :
                'bg-yellow-900/30 text-yellow-300'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>
                    {tabSwitchCount === 1 ? '1 tab switch detected' :
                     tabSwitchCount === 2 ? '2 tab switches detected - One more will auto-submit!' :
                     'Maximum violations reached!'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div 
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">
              Question {currentQuestion + 1}: {currentQ?.text}
            </h3>

            {currentQ?.type === 'multiple-choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`w-full text-left p-4 rounded-lg border ${
                      answers[currentQuestion] === option
                        ? 'bg-orange-900 border-orange-500'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border mr-3 ${
                        answers[currentQuestion] === option
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-600'
                      }`}></div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQ?.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`p-6 rounded-lg border text-center ${
                      answers[currentQuestion] === option
                        ? option === 'True' ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ?.type === 'short-answer' && (
              <textarea
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4"
                placeholder="Your answer..."
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg ${
                currentQuestion === 0 ? 'bg-gray-800 text-gray-500' : 'bg-gray-700'
              }`}
            >
              ← Previous
            </button>
            
            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-orange-600 rounded-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 rounded-lg"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results page
  const scoresReleased = checkScoresReleased();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4 max-w-4xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-gray-900 rounded-xl p-8 mb-8 text-center">
          <div className="text-6xl font-bold mb-2">✅</div>
          <h1 className="text-3xl font-bold mb-4">Quiz Submitted!</h1>
          <p className="text-gray-400 text-xl mb-6">{quiz.title}</p>
          
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-300">Submission Successful</h3>
            <p className="text-gray-300 mb-4">
              Your quiz has been saved. {scoresReleased ? 'Scores are available!' : 'Results pending instructor review.'}
            </p>
            <div className="text-yellow-300">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scoresReleased ? 'Check your results below' : 'Check back later for scores'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Answered</div>
              <div className="text-2xl font-bold">
                {Object.keys(answers).length}/{quiz.questions?.length || 0}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Violations</div>
              <div className="text-2xl font-bold">{tabSwitchCount}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;