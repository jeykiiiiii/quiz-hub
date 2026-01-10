import React, { useState, useEffect } from 'react';
import { getQuizSubmissions, releaseQuizScores, releaseStudentScore } from '../../utils/quizGrading';

function QuizGrading() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load quizzes on mount
  useEffect(() => {
    const allQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    const assignedQuizzes = allQuizzes.filter(q => q.status === 'assigned');
    setQuizzes(assignedQuizzes);
    
    // Select first quiz if available
    if (assignedQuizzes.length > 0 && !selectedQuiz) {
      setSelectedQuiz(assignedQuizzes[0]);
    }
  }, []);

  // Load submissions when quiz is selected
  useEffect(() => {
    if (selectedQuiz) {
      const quizSubmissions = getQuizSubmissions(selectedQuiz.id);
      setSubmissions(quizSubmissions);
    }
  }, [selectedQuiz]);

  // Handle releasing scores for all students
  const handleReleaseAllScores = () => {
    if (!selectedQuiz) return;
    
    if (window.confirm(`Are you sure you want to release scores for ALL students in "${selectedQuiz.title}"? This cannot be undone.`)) {
      releaseQuizScores(selectedQuiz.id);
      alert('Scores released successfully for all students!');
      
      // Refresh submissions
      const updatedSubmissions = getQuizSubmissions(selectedQuiz.id);
      setSubmissions(updatedSubmissions);
    }
  };

  // Handle releasing individual score
  const handleReleaseStudentScore = (submission) => {
    if (window.confirm(`Release score for this student submission?`)) {
      releaseStudentScore(submission);
      
      // Refresh
      const updatedSubmissions = getQuizSubmissions(selectedQuiz.id);
      setSubmissions(updatedSubmissions);
      alert('Score released for student!');
    }
  };

  // Filter submissions by search
  const filteredSubmissions = submissions.filter(sub => 
    (sub.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.class || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const calculateStats = () => {
    const total = submissions.length;
    const released = submissions.filter(s => s.scoreReleased).length;
    const averageScore = released > 0 
      ? Math.round(submissions.filter(s => s.scoreReleased)
          .reduce((sum, s) => sum + (s.score?.percentage || 0), 0) / released)
      : 0;
    
    return { total, released, averageScore };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Grade Quizzes</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Submissions</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Scores Released</div>
          <div className="text-2xl font-bold">{stats.released}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Average Score</div>
          <div className="text-2xl font-bold">{stats.averageScore}%</div>
        </div>
      </div>

      {/* Quiz selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Select Quiz to Grade</h3>
        {quizzes.length === 0 ? (
          <div className="text-center py-8 bg-gray-900 rounded-lg">
            <p className="text-gray-400">No assigned quizzes found.</p>
            <p className="text-sm text-gray-500 mt-2">Create and assign quizzes to see submissions here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => setSelectedQuiz(quiz)}
                className={`p-4 rounded-lg border text-left transition ${selectedQuiz?.id === quiz.id ? 'bg-orange-900 border-orange-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
              >
                <h4 className="font-semibold">{quiz.title}</h4>
                <p className="text-sm text-gray-400">{quiz.class}</p>
                <p className="text-sm text-gray-400">
                  {quiz.questions?.length || 0} questions • {quiz.points || 'Unmarked'} points
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded">
                    {getQuizSubmissions(quiz.id).length} submissions
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submissions list */}
      {selectedQuiz && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold">{selectedQuiz.title} - Submissions</h3>
              <p className="text-gray-400">{selectedQuiz.class} • {submissions.length} students submitted</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-4 py-2 flex-1 md:flex-none"
              />
              
              {/* Release all scores button */}
              <button
                onClick={handleReleaseAllScores}
                disabled={submissions.length === 0}
                className={`px-4 py-2 rounded-lg transition ${submissions.length === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Release All Scores
              </button>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchTerm ? 'No submissions match your search.' : 'No submissions yet for this quiz.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Submitted</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Violations</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Student {index + 1}</p>
                          <p className="text-sm text-gray-400">
                            Submitted: {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {sub.scoreReleased ? (
                          <div>
                            <span className="font-bold text-xl">{sub.score?.percentage}%</span>
                            <div className="text-sm text-gray-400">
                              {sub.score?.correct}/{sub.score?.total} correct
                            </div>
                            {sub.score?.points > 0 && (
                              <div className="text-sm text-green-400">
                                {sub.score?.points}/{sub.score?.maxPoints} points
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <span className="text-lg">--%</span>
                            <div className="text-sm">Not released</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sub.scoreReleased 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {sub.scoreReleased ? 'Released' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {sub.violations > 0 ? (
                          <span className="px-2 py-1 text-xs bg-red-900 text-red-300 rounded">
                            {sub.violations} violation(s)
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // View submission details
                              const details = `
Quiz: ${sub.quizTitle}
Class: ${sub.class}
Submitted: ${new Date(sub.submittedAt).toLocaleString()}
Time Taken: ${Math.round(sub.timeTaken/60)} minutes
Violations: ${sub.violations || 0}
${sub.scoreReleased ? `
SCORE RELEASED:
- Score: ${sub.score?.percentage}%
- Correct: ${sub.score?.correct}/${sub.score?.total}
- Points: ${sub.score?.points}/${sub.score?.maxPoints}
- Released: ${new Date(sub.releasedAt).toLocaleString()}
` : 'Score not released yet'}
                              `.trim();
                              
                              alert(details);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            View Details
                          </button>
                          
                          {!sub.scoreReleased && (
                            <button
                              onClick={() => handleReleaseStudentScore(sub)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                            >
                              Release Score
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizGrading;