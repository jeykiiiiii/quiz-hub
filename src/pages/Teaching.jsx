import { useState, useEffect } from 'react';
import QuizHeader from '../components/instructor/QuizHeader';
import QuizBody from '../components/instructor/QuizBody';
import Menu from '../components/instructor/Menu';

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
  
  // Modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  
  // Dashboard state
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [classes, setClasses] = useState([
    { id: 1, name: 'DCIT 26', code: 'DCIT26', students: 45 },
    { id: 2, name: 'DCIT 34', code: 'DCIT34', students: 38 },
    { id: 3, name: 'DCIT 42', code: 'DCIT42', students: 52 },
  ]);
  const [selectedClass, setSelectedClass] = useState('DCIT 26');

  // Load saved quizzes from localStorage
  useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    setQuizzes(savedQuizzes);
  }, []);

  // Save quizzes to localStorage
  useEffect(() => {
    localStorage.setItem('teacherQuizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  // Menu links for QuizHeader
  const menuLinks = [
    { id: 'save-draft', label: 'Save as draft' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete' },
  ];

  // Handle menu item selection
  const handleMenuSelect = (item) => {
    switch (item.id) {
      case 'save-draft':
        saveAsDraft();
        break;
      case 'duplicate':
        duplicateQuiz();
        break;
      case 'delete':
        deleteQuiz();
        break;
      case 'schedule':
        // Handled by ScheduleModal
        break;
    }
  };

  // Save quiz as draft
  const saveAsDraft = () => {
    if (!title.trim()) {
      alert('Please add a title for the quiz');
      return;
    }

    const newQuiz = {
      id: Date.now(),
      title: title || 'Untitled Quiz',
      instructions,
      questions: [...questions],
      points: unmarked ? null : points,
      timerMinutes: noTimer ? null : timerMinutes,
      scheduleDate: noDue ? null : scheduleDate,
      topic: noTopic ? null : topic,
      closeAfterDue,
      class: selectedClass,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    setQuizzes([...quizzes, newQuiz]);
    resetQuizForm();
    setActiveTab('my-quizzes');
    alert('Quiz saved as draft!');
  };

  // Assign/Post quiz to class
  const handleAssign = () => {
    if (!title.trim()) {
      alert('Please add a title for the quiz');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }

    const newQuiz = {
      id: Date.now(),
      title: title || 'Untitled Quiz',
      instructions,
      questions: [...questions],
      points: unmarked ? null : points,
      timerMinutes: noTimer ? null : timerMinutes,
      scheduleDate: noDue ? null : scheduleDate,
      topic: noTopic ? null : topic,
      closeAfterDue,
      class: selectedClass,
      createdAt: new Date().toISOString(),
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };

    setQuizzes([...quizzes, newQuiz]);
    resetQuizForm();
    setActiveTab('my-quizzes');
    alert(`Quiz "${newQuiz.title}" assigned to ${selectedClass}!`);
  };

  // Duplicate quiz
  const duplicateQuiz = () => {
    if (selectedQuiz) {
      const duplicated = {
        ...selectedQuiz,
        id: Date.now(),
        title: `${selectedQuiz.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      setQuizzes([...quizzes, duplicated]);
      alert('Quiz duplicated!');
    }
  };

  // Delete quiz
  const deleteQuiz = () => {
    if (selectedQuiz && window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
      setSelectedQuiz(null);
      alert('Quiz deleted!');
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
    setUnmarked(quiz.points === null);
    setNoDue(quiz.scheduleDate === null);
    setNoTopic(quiz.topic === null);
    setNoTimer(quiz.timerMinutes === null);
    setTimerMinutes(quiz.timerMinutes || 30);
    setScheduleDate(quiz.scheduleDate || '');
    setTopic(quiz.topic || '');
    setCloseAfterDue(quiz.closeAfterDue || false);
    setSelectedClass(quiz.class || 'DCIT 26');
    setActiveTab('create');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">Teaching Dashboard</h1>
          <div className="flex gap-4">
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'create' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('create')}
            >
              Create Quiz
            </button>
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'my-quizzes' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('my-quizzes')}
            >
              My Quizzes
            </button>
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'classes' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('classes')}
            >
              My Classes
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Logout
        </button>
      </nav>

      <div className="p-6">
        {activeTab === 'create' && (
          <div className="flex gap-6">
            {/* Left sidebar - Quiz creation */}
            <div className="flex-1">
              <QuizHeader
                menuLinks={menuLinks}
                onSelect={handleMenuSelect}
                assignEnabled={title.trim().length > 0 && questions.length > 0}
                onAssign={handleAssign}
              />
              
              <QuizBody
                title={title}
                setTitle={setTitle}
                instructions={instructions}
                setInstructions={setInstructions}
                questions={questions}
                setQuestions={setQuestions}
              />
            </div>

            {/* Right sidebar - Quiz settings */}
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
              
              {/* Class selector */}
              <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Assign to Class</h3>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 mb-3"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} ({cls.code}) - {cls.students} students
                    </option>
                  ))}
                </select>
                
                <div className="text-sm text-gray-400">
                  <p>This quiz will be assigned to all students in {selectedClass}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-quizzes' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">My Quizzes</h2>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <p className="text-gray-400">No quizzes yet. Create your first quiz!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                >
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.status === 'assigned' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {quiz.status === 'assigned' ? 'Assigned' : 'Draft'}
                        </span>
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
                      <p>Class: {quiz.class}</p>
                      <p>Questions: {quiz.questions?.length || 0}</p>
                      {quiz.points && <p>Points: {quiz.points}</p>}
                      {quiz.scheduleDate && <p>Due: {new Date(quiz.scheduleDate).toLocaleDateString()}</p>}
                      <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      ID: {quiz.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'view' && selectedQuiz && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
              <button
                onClick={() => setActiveTab('my-quizzes')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back to Quizzes
              </button>
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
                  <p className="font-medium">{selectedQuiz.class}</p>
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
                              <li key={i} className="text-sm">• {opt}</li>
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

        {activeTab === 'classes' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">My Classes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map(cls => (
                <div key={cls.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{cls.name}</h3>
                      <p className="text-gray-400">Code: {cls.code}</p>
                    </div>
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {cls.students} students
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Assigned Quizzes</h4>
                    <p className="text-sm text-gray-400">
                      {quizzes.filter(q => q.class === cls.name && q.status === 'assigned').length} active quizzes
                    </p>
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
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      View Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Create new class button */}
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-dashed border-gray-600">
                + Create New Class
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
