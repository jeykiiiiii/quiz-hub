import { useState, useEffect } from 'react';
import Header from '../components/Header';
import QuizBody from '../components/instructor/QuizBody';
import Menu from '../components/instructor/Menu';
import QuizGrading from '../components/instructor/QuizGrading';
import { getUniqueClassCode, getTeacherName } from '../utils/classUtils';
import { getSharedClasses, addSharedClass, removeSharedClass } from '../utils/sharedClasses';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-900 rounded-xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-1"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Notification Modal Component
const NotificationModal = ({ isOpen, onClose, type = 'info', title, message, onConfirm, confirmText = 'OK', showCancel = false, cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  const typeClasses = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  const iconClasses = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-12 h-12 ${typeClasses[type]} rounded-full flex items-center justify-center`}>
            {type === 'success' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {type === 'warning' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {type === 'info' && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="text-gray-300 whitespace-pre-line">{message}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 rounded-lg transition ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              type === 'success' ? 'bg-green-600 hover:bg-green-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Teaching({ setIsAuthenticated }) {
  // Quiz state
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // Menu state
  const [points, setPoints] = useState(100);
  const [unmarked, setUnmarked] = useState(false);
  const [noDue, setNoDue] = useState(false);
  const [noTopic, setNoTopic] = useState(false);
  const [noTimer, setNoTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [scheduleDate, setScheduleDate] = useState('');
  const [topic, setTopic] = useState('');
  const [closeAfterDue, setCloseAfterDue] = useState(false);
  
  // Dashboard state
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Modal states
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [newClassSchedule, setNewClassSchedule] = useState('');
  
  // Notification modal states
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false
  });
  
  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: '',
    id: null,
    name: ''
  });

  // Class details modal state
  const [classDetailsModal, setClassDetailsModal] = useState({
    isOpen: false,
    class: null
  });

  // Initialize on component mount
  useEffect(() => {
    console.log('Teaching component mounted - loading data...');
    
    const allClasses = getSharedClasses();
    console.log('All classes from storage:', allClasses);
    const teacherClasses = allClasses.filter(cls => cls.createdBy === 'teacher');
    setClasses(teacherClasses);
    
    if (teacherClasses.length > 0) {
      setSelectedClass(teacherClasses[0]?.name || '');
    }
    
    const savedQuizzes = loadQuizzesFromStorage();
    console.log('Loaded quizzes from storage:', savedQuizzes.length);
    setQuizzes(savedQuizzes);
  }, []);

  // Function to load quizzes from localStorage
  const loadQuizzesFromStorage = () => {
    try {
      const savedQuizzes = localStorage.getItem('teacherQuizzes');
      if (savedQuizzes) {
        return JSON.parse(savedQuizzes);
      }
    } catch (error) {
      console.error('Error loading quizzes from localStorage:', error);
    }
    return [];
  };

  // Function to save quizzes to localStorage
  const saveQuizzesToStorage = (quizzesArray) => {
    try {
      localStorage.setItem('teacherQuizzes', JSON.stringify(quizzesArray));
      console.log('Saved quizzes to localStorage:', quizzesArray.length);
      
      const assignedQuizzes = quizzesArray.filter(q => q.status === 'assigned');
      localStorage.setItem('assignedQuizzes', JSON.stringify(assignedQuizzes));
      console.log('Saved assigned quizzes for students:', assignedQuizzes.length);
      
      const allClasses = JSON.parse(localStorage.getItem('allClasses') || '[]');
      const updatedClasses = allClasses.map(cls => {
        const classQuizzes = assignedQuizzes.filter(q => q.classCode === cls.code);
        return {
          ...cls,
          quizCount: classQuizzes.length
        };
      });
      localStorage.setItem('allClasses', JSON.stringify(updatedClasses));
      
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error);
    }
  };

  // Save quizzes to localStorage whenever they change
  useEffect(() => {
    if (quizzes.length > 0) {
      saveQuizzesToStorage(quizzes);
    }
  }, [quizzes]);

  // Get class code by class name
  const getClassCodeByName = (className) => {
    const classObj = classes.find(c => c.name === className);
    return classObj ? classObj.code : '';
  };

  // Handle creating a new class
  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      showNotification('error', 'Error', 'Please enter a class name');
      return;
    }
    
    const classCode = getUniqueClassCode();
    const teacherName = getTeacherName();
    
    const newClass = {
      code: classCode,
      name: newClassName,
      schedule: newClassSchedule || 'To be announced',
      instructor: teacherName,
      description: newClassDescription,
      createdBy: 'teacher',
      createdAt: new Date().toISOString(),
      students: 0
    };
    
    addSharedClass(newClass);
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    setSelectedClass(newClassName);
    
    setNewClassName('');
    setNewClassDescription('');
    setNewClassSchedule('');
    setShowCreateClassModal(false);
    
    showNotification('success', 'Class Created', 
      `Class "${newClassName}" created successfully!\n\nClass Code: ${classCode}\n\nShare this code with your students so they can join.`);
  };

  // Save quiz as draft
  const saveAsDraft = () => {
    if (!title.trim()) {
      showNotification('warning', 'Missing Title', 'Please add a title for the quiz');
      return;
    }

    if (!selectedClass) {
      showNotification('warning', 'No Class Selected', 'Please select a class first');
      return;
    }

    const classCode = getClassCodeByName(selectedClass);
    
    const newQuiz = {
      id: Date.now().toString(),
      title: title || 'Untitled Quiz',
      instructions,
      questions: [...questions],
      points: unmarked ? null : points,
      timerMinutes: noTimer ? null : timerMinutes,
      scheduleDate: noDue ? null : scheduleDate,
      topic: noTopic ? null : topic,
      closeAfterDue,
      class: selectedClass,
      classCode: classCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      assignedAt: null,
    };

    console.log('Saving draft quiz:', newQuiz);
    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    saveQuizzesToStorage(updatedQuizzes);
    resetQuizForm();
    setActiveTab('my-quizzes');
    showNotification('success', 'Draft Saved', 'Quiz saved as draft!');
  };

  // Assign/Post quiz to class
  const handleAssign = () => {
    if (!title.trim()) {
      showNotification('warning', 'Missing Title', 'Please add a title for the quiz');
      return;
    }

    if (questions.length === 0) {
      showNotification('warning', 'No Questions', 'Please add at least one question to the quiz');
      return;
    }

    if (!selectedClass) {
      showNotification('warning', 'No Class Selected', 'Please select a class first');
      return;
    }

    const classCode = getClassCodeByName(selectedClass);
    
    const newQuiz = {
      id: Date.now().toString(),
      title: title || 'Untitled Quiz',
      instructions,
      questions: [...questions],
      points: unmarked ? null : points,
      timerMinutes: noTimer ? null : timerMinutes,
      scheduleDate: noDue ? null : scheduleDate,
      topic: noTopic ? null : topic,
      closeAfterDue,
      class: selectedClass,
      classCode: classCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };

    console.log('Assigning quiz:', newQuiz);
    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    saveQuizzesToStorage(updatedQuizzes);
    resetQuizForm();
    setActiveTab('my-quizzes');
    showNotification('success', 'Quiz Assigned', `Quiz "${newQuiz.title}" assigned to ${selectedClass}!`);
  };

  const verifySubmissions = () => {
    console.log('=== VERIFYING ALL SUBMISSIONS ===');
    
    const studentResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    const teacherQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    
    console.log('Total submissions in storage:', studentResults.length);
    console.log('All submissions:', studentResults);
    console.log('Teacher quizzes:', teacherQuizzes);
    
    quizzes.forEach(quiz => {
      const submissions = getQuizSubmissions(quiz.id);
      console.log(`\nQuiz: ${quiz.title} (ID: ${quiz.id})`);
      console.log(`  Status: ${quiz.status}`);
      console.log(`  Submissions: ${submissions.count}`);
      console.log(`  Released: ${submissions.released}`);
      console.log(`  Submission details:`, submissions.results.map(r => ({
        student: r.studentName || r.studentEmail,
        score: r.score,
        released: r.scoreReleased
      })));
    });
    
    showNotification('info', 'Storage Verification', 
      `Total submissions in system: ${studentResults.length}\n\nCheck browser console for details.`);
  };

  // Show delete confirmation for quiz
  const showDeleteQuizConfirmation = (quiz) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'quiz',
      id: quiz.id,
      name: quiz.title
    });
  };

  // Show delete confirmation for class
  const showDeleteClassConfirmation = (classItem) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'class',
      id: classItem.code,
      name: classItem.name
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    const { type, id, name } = deleteConfirmation;
    
    if (type === 'quiz') {
      const updatedQuizzes = quizzes.filter(q => q.id !== id);
      setQuizzes(updatedQuizzes);
      saveQuizzesToStorage(updatedQuizzes);
      setSelectedQuiz(null);
      showNotification('success', 'Quiz Deleted', `Quiz "${name}" has been deleted.`);
    } else if (type === 'class') {
      removeSharedClass(id);
      
      const updatedQuizzes = quizzes.filter(q => q.classCode !== id);
      setQuizzes(updatedQuizzes);
      saveQuizzesToStorage(updatedQuizzes);
      
      const updatedClasses = classes.filter(cls => cls.code !== id);
      setClasses(updatedClasses);
      
      showNotification('success', 'Class Deleted', `Class "${name}" has been deleted.`);
    }
    
    setDeleteConfirmation({ isOpen: false, type: '', id: null, name: '' });
  };

  // Delete quiz
  const deleteQuiz = () => {
    if (selectedQuiz) {
      showDeleteQuizConfirmation(selectedQuiz);
    }
  };

  // Delete class
  const deleteClass = (classCode) => {
    const classItem = classes.find(c => c.code === classCode);
    if (classItem) {
      showDeleteClassConfirmation(classItem);
    }
  };

  // Reset form
  const resetQuizForm = () => {
    setTitle('');
    setInstructions('');
    setQuestions([]);
    setPoints(100);
    setUnmarked(false);
    setNoDue(false);
    setNoTopic(false);
    setNoTimer(false);
    setTimerMinutes(30);
    setScheduleDate('');
    setTopic('');
    setCloseAfterDue(false);
  };

  // View quiz details
  const viewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('view');
  };

  // Edit quiz
  const editQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setTitle(quiz.title);
    setInstructions(quiz.instructions);
    setQuestions(quiz.questions || []);
    setPoints(quiz.points || 100);
    setUnmarked(quiz.points === null || quiz.points === undefined);
    setNoDue(quiz.scheduleDate === null || quiz.scheduleDate === undefined);
    setNoTopic(quiz.topic === null || quiz.topic === undefined);
    setNoTimer(quiz.timerMinutes === null || quiz.timerMinutes === undefined);
    setTimerMinutes(quiz.timerMinutes || 30);
    setScheduleDate(quiz.scheduleDate || '');
    setTopic(quiz.topic || '');
    setCloseAfterDue(quiz.closeAfterDue || false);
    setSelectedClass(quiz.class || '');
    setActiveTab('create');
  };

  // Get submissions count for a quiz
  const getQuizSubmissions = (quizId) => {
    try {
      const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
      const teacherResults = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
      
      const searchQuizId = quizId?.toString();
      const quiz = teacherResults.find(q => {
        const qId = q.id?.toString();
        return qId === searchQuizId || q.id === quizId;
      });
      
      const quizResults = allResults.filter(r => {
        const rQuizId = r.quizId?.toString();
        const rQuizTitle = r.quizTitle?.toLowerCase();
        const quizTitle = quiz?.title?.toLowerCase();
        
        return (
          rQuizId === searchQuizId ||
          rQuizId === quizId?.toString() ||
          parseInt(rQuizId) === parseInt(searchQuizId) ||
          (rQuizTitle && quizTitle && rQuizTitle === quizTitle)
        );
      });
      
      return {
        count: quizResults.length,
        released: quizResults.filter(r => r.scoreReleased).length,
        results: quizResults
      };
    } catch (error) {
      console.error('Error getting quiz submissions:', error);
      return { count: 0, released: 0, results: [] };
    }
  };

  // Mock function for Join Class in header
  const handleJoinClassClick = () => {
    showNotification('info', 'Information', "Instructors can't join classes - they create them!");
  };

  // Handle viewing class details
  const handleViewClass = (classItem) => {
    setClassDetailsModal({
      isOpen: true,
      class: classItem
    });
  };

  // Show notification modal
  const showNotification = (type, title, message, onConfirm = null, confirmText = 'OK', showCancel = false) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      showCancel
    });
  };

  // Calculate quiz statistics
  const getClassQuizStats = (className) => {
    const classQuizzes = quizzes.filter(q => q.class === className && q.status === 'assigned');
    const totalPoints = classQuizzes.reduce((sum, quiz) => sum + (quiz.points || 0), 0);
    const totalQuestions = classQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);
    
    let totalSubmissions = 0;
    classQuizzes.forEach(quiz => {
      const submissions = getQuizSubmissions(quiz.id);
      totalSubmissions += submissions.count;
    });
    
    return {
      quizzes: classQuizzes.length,
      points: totalPoints,
      questions: totalQuestions,
      submissions: totalSubmissions
    };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        setIsAuthenticated={setIsAuthenticated}
        onJoinClassClick={handleJoinClassClick}
      />

      <div className="flex">
        {/* SIDEBAR NAVIGATION */}
        <div className="w-64 bg-gray-900 min-h-[calc(100vh-80px)] p-6 border-r border-gray-800">
          <h2 className="text-xl font-bold mb-6 text-gray-300">Instructor Panel</h2>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'create' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Quiz</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('my-quizzes')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'my-quizzes' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Quizzes</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('grading')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'grading' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Grade Quizzes</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === 'classes' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.197v-1a6 6 0 00-9-5.197M9 21v-1a6 6 0 0112 0v1" />
                </svg>
                <span>My Classes</span>
              </div>
            </button>
          </nav>

          <div className="mt-12 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="font-bold">I</span>
              </div>
              <div>
                <p className="font-medium">Instructor</p>
                <p className="text-sm text-gray-400">Teacher Account</p>
              </div>
            </div>
            
            <div className="mt-4">

            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          {/* CREATE QUIZ TAB */}
          {activeTab === 'create' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Create New Quiz</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveAsDraft}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={handleAssign}
                      disabled={!title.trim() || questions.length === 0 || !selectedClass}
                      className={`px-6 py-2 rounded-lg transition ${title.trim() && questions.length > 0 && selectedClass ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                      Assign to Class
                    </button>
                  </div>
                </div>
                
                <QuizBody
                  title={title}
                  setTitle={setTitle}
                  instructions={instructions}
                  setInstructions={setInstructions}
                  questions={questions}
                  setQuestions={setQuestions}
                />
              </div>

              <div className="w-80">
                <Menu
                  points={points}
                  setPoints={setPoints}
                  unmarked={unmarked}
                  setUnmarked={setUnmarked}
                  noDue={noDue}
                  setNoDue={setNoDue}
                  noTopic={noTopic}
                  setNoTopic={setNoTopic}
                  noTimer={noTimer}
                  setNoTimer={setNoTimer}
                  timerMinutes={timerMinutes}
                  setTimerMinutes={setTimerMinutes}
                  scheduleDate={scheduleDate}
                  setScheduleDate={setScheduleDate}
                  topic={topic}
                  setTopic={setTopic}
                  closeAfterDue={closeAfterDue}
                  setCloseAfterDue={setCloseAfterDue}
                />
                
                <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Assign to Class</h3>
                  {classes.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-3">No classes created yet</p>
                      <button
                        onClick={() => {
                          setActiveTab('classes');
                          setShowCreateClassModal(true);
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                      >
                        Create Class
                      </button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 mb-3"
                      >
                        <option value="">Select a class</option>
                        {classes.map(cls => (
                          <option key={cls.code} value={cls.name}>
                            {cls.name} ({cls.code})
                          </option>
                        ))}
                      </select>
                      
                      {selectedClass && (
                        <div className="text-sm text-gray-400 p-3 bg-gray-800 rounded">
                          <p>This quiz will be assigned to:</p>
                          <p className="font-medium text-white mt-1">{selectedClass}</p>
                          <p className="mt-1">Class Code: {getClassCodeByName(selectedClass)}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MY QUIZZES TAB */}
          {activeTab === 'my-quizzes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Quizzes</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                  >
                    + Create New Quiz
                  </button>
                </div>
              </div>
              
              {quizzes.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <p className="text-gray-400">No quizzes yet. Create your first quiz!</p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                    >
                      Create Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map(quiz => {
                    const submissions = getQuizSubmissions(quiz.id);
                    
                    return (
                      <div key={quiz.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                quiz.status === 'assigned' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                              }`}>
                                {quiz.status === 'assigned' ? 'Assigned' : 'Draft'}
                              </span>
                              {quiz.class && (
                                <span className="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded-full">
                                  {quiz.class}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewQuiz(quiz)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => editQuiz(quiz)}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1 mb-3">
                          <p>Class: {quiz.class || 'Not assigned'}</p>
                          <p>Questions: {quiz.questions?.length || 0}</p>
                          {quiz.points && <p>Points: {quiz.points}</p>}
                          {quiz.scheduleDate && <p>Due: {new Date(quiz.scheduleDate).toLocaleDateString()}</p>}
                          
                          {quiz.status === 'assigned' ? (
                            <div className="mt-2">
                              <div className="flex justify-between items-center">
                                <span>Submissions:</span>
                                <span className="text-white font-medium">{submissions.count} students</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Scores Released:</span>
                                <span className="text-green-400 font-medium">{submissions.released}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-yellow-400 mt-2">Draft - Not visible to students</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GRADE QUIZZES TAB */}
          {activeTab === 'grading' && <QuizGrading />}

          {/* VIEW QUIZ DETAILS */}
          {activeTab === 'view' && selectedQuiz && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('my-quizzes')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Back to Quizzes
                  </button>
                  <button
                    onClick={() => editQuiz(selectedQuiz)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                  >
                    Edit Quiz
                  </button>
                  <button
                    onClick={() => showDeleteQuizConfirmation(selectedQuiz)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Delete Quiz
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3">Quiz Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="font-medium">{selectedQuiz.status === 'assigned' ? 'Assigned' : 'Draft'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Class</p>
                    <p className="font-medium">{selectedQuiz.class || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Points</p>
                    <p className="font-medium">{selectedQuiz.points || 'Unmarked'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Timer</p>
                    <p className="font-medium">{selectedQuiz.timerMinutes ? `${selectedQuiz.timerMinutes} minutes` : 'No timer'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Due Date</p>
                    <p className="font-medium">{selectedQuiz.scheduleDate ? new Date(selectedQuiz.scheduleDate).toLocaleDateString() : 'No due date'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Topic</p>
                    <p className="font-medium">{selectedQuiz.topic || 'No topic'}</p>
                  </div>
                </div>
                
                {selectedQuiz.status === 'assigned' && (
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <h4 className="text-lg font-semibold mb-3">Submission Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800 p-4 rounded">
                        <p className="text-gray-400 text-sm">Total Submissions</p>
                        <p className="text-2xl font-bold">{getQuizSubmissions(selectedQuiz.id).count}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded">
                        <p className="text-gray-400 text-sm">Scores Released</p>
                        <p className="text-2xl font-bold text-green-400">{getQuizSubmissions(selectedQuiz.id).released}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded">
                        <p className="text-gray-400 text-sm">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {getQuizSubmissions(selectedQuiz.id).count - getQuizSubmissions(selectedQuiz.id).released}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedQuiz.instructions && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Instructions</h4>
                    <div className="bg-gray-800 p-4 rounded" dangerouslySetInnerHTML={{ __html: selectedQuiz.instructions }} />
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Questions ({selectedQuiz.questions?.length || 0})</h3>
                
                {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedQuiz.questions.map((q, index) => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Question {index + 1}: {q.text}</h4>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">{q.type}</span>
                        </div>
                        
                        {q.type === 'multiple-choice' && q.options && q.options.length > 0 && (
                          <div className="ml-4 mt-2">
                            <p className="text-sm text-gray-400 mb-1">Options:</p>
                            <ul className="space-y-1">
                              {q.options.map((opt, i) => (
                                <li key={i} className={`text-sm ${opt === q.answerKey ? 'text-green-400 font-medium' : ''}`}>
                                  • {opt} {opt === q.answerKey && '✓'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {q.answerKey && (
                          <div className="mt-2">
                            <p className="text-sm text-green-400">Answer Key: {q.answerKey}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No questions in this quiz.</p>
                )}
              </div>
            </div>
          )}

          {/* CLASSES TAB */}
          {activeTab === 'classes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Classes</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateClassModal(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Class
                  </button>
                </div>
              </div>
              
              {classes.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <p className="text-gray-400 mb-4">No classes yet. Create your first class!</p>
                  <button
                    onClick={() => setShowCreateClassModal(true)}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                  >
                    Create Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map(cls => {
                    const stats = getClassQuizStats(cls.name);
                    
                    return (
                      <div key={cls.code} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">{cls.name}</h3>
                            <div className="mt-1">
                              <span className="inline-block bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                Code: {cls.code}
                              </span>
                            </div>
                            <p className="text-gray-400 mt-2">{cls.schedule}</p>
                            <p className="text-gray-400 text-sm">Instructor: {cls.instructor}</p>
                            {cls.description && (
                              <p className="text-sm text-gray-500 mt-2">{cls.description}</p>
                            )}
                          </div>
                          <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                            {cls.students || 0} students
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Assigned Quizzes:</span>
                            <span className="text-gray-300">{stats.quizzes}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Submissions:</span>
                            <span className="text-gray-300">{stats.submissions}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-400">Total Points:</span>
                            <span className="text-gray-300">{stats.points}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-400">Total Questions:</span>
                            <span className="text-gray-300">{stats.questions}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedClass(cls.name);
                              setActiveTab('create');
                            }}
                            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                          >
                            Create Quiz
                          </button>
                          <button
                            onClick={() => handleViewClass(cls)}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                          >
                            View Class
                          </button>
                          <button
                            onClick={() => deleteClass(cls.code)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
                            title="Delete Class"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CLASS MODAL */}
      <Modal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        title="Create New Class"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Class Name *</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3"
              placeholder="e.g., Introduction to Programming"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Schedule</label>
            <input
              type="text"
              value={newClassSchedule}
              onChange={(e) => setNewClassSchedule(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3"
              placeholder="e.g., Mon-Wed-Fri 9:00 AM"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Description (Optional)</label>
            <textarea
              value={newClassDescription}
              onChange={(e) => setNewClassDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3"
              placeholder="Brief description of the class"
              rows="3"
            />
          </div>
          
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-sm text-gray-400">
              <span className="font-medium">Note:</span> A unique 6-character class code will be automatically generated for you to share with students.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowCreateClassModal(false)}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateClass}
            disabled={!newClassName.trim()}
            className={`flex-1 px-4 py-3 rounded-lg transition ${
              !newClassName.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            Create Class
          </button>
        </div>
      </Modal>

      {/* CLASS DETAILS MODAL */}
      <Modal
        isOpen={classDetailsModal.isOpen}
        onClose={() => setClassDetailsModal({ isOpen: false, class: null })}
        title={`Class Details: ${classDetailsModal.class?.name || ''}`}
        size="lg"
      >
        {classDetailsModal.class && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Class Code</p>
                <p className="text-lg font-semibold">{classDetailsModal.class.code}</p>
              </div>
              <div>
                <p className="text-gray-400">Schedule</p>
                <p className="text-lg font-semibold">{classDetailsModal.class.schedule}</p>
              </div>
              <div>
                <p className="text-gray-400">Instructor</p>
                <p className="text-lg font-semibold">{classDetailsModal.class.instructor}</p>
              </div>
              <div>
                <p className="text-gray-400">Students</p>
                <p className="text-lg font-semibold">{classDetailsModal.class.students || 0}</p>
              </div>
            </div>
            
            {classDetailsModal.class.description && (
              <div>
                <p className="text-gray-400">Description</p>
                <p className="mt-1 p-3 bg-gray-800 rounded">{classDetailsModal.class.description}</p>
              </div>
            )}
            
            <div>
              <p className="text-gray-400">Created</p>
              <p className="mt-1">{new Date(classDetailsModal.class.createdAt).toLocaleDateString()} at {new Date(classDetailsModal.class.createdAt).toLocaleTimeString()}</p>
            </div>
            
            {/* Active Quizzes Section */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-lg font-semibold mb-3">Active Quizzes</h4>
              {(() => {
                const classQuizzes = quizzes.filter(q => q.class === classDetailsModal.class.name && q.status === 'assigned');
                
                if (classQuizzes.length === 0) {
                  return <p className="text-gray-400 text-center py-4">No active quizzes for this class</p>;
                }
                
                return (
                  <div className="space-y-3">
                    {classQuizzes.map((quiz, index) => {
                      const submissions = getQuizSubmissions(quiz.id);
                      return (
                        <div key={quiz.id} className="bg-gray-800 p-3 rounded">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{quiz.title}</p>
                              <div className="flex gap-3 text-sm text-gray-400 mt-1">
                                <span>Due: {quiz.scheduleDate ? new Date(quiz.scheduleDate).toLocaleDateString() : 'No due date'}</span>
                                <span>Points: {quiz.points || 'Unmarked'}</span>
                                <span>Questions: {quiz.questions?.length || 0}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{submissions.count} submissions</p>
                              <p className="text-sm text-green-400">{submissions.released} released</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedClass(classDetailsModal.class.name);
                  setActiveTab('create');
                  setClassDetailsModal({ isOpen: false, class: null });
                }}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                Create Quiz for This Class
              </button>
              <button
                onClick={() => setClassDetailsModal({ isOpen: false, class: null })}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <NotificationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, type: '', id: null, name: '' })}
        type="warning"
        title={`Delete ${deleteConfirmation.type === 'quiz' ? 'Quiz' : 'Class'}?`}
        message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.${
          deleteConfirmation.type === 'class' ? '\n\nAll quizzes and student data for this class will also be deleted.' : ''
        }`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        showCancel={true}
        cancelText="Cancel"
      />

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        showCancel={notification.showCancel}
      />
    </div>
  );
}