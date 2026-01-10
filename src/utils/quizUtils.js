// utils/quizUtils.js

// Get student's quiz results
export const getStudentQuizResults = () => {
  return JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
};

// Check if quiz is completed
export const isQuizCompleted = (quizId) => {
  const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
  return completedQuizzes.includes(quizId);
};

// Get quiz by ID
export const getQuizById = (quizId) => {
  const allQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
  return allQuizzes.find(q => q.id === quizId);
};

// Calculate overall student statistics
export const getStudentStats = () => {
  const results = getStudentQuizResults();
  
  if (results.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalPoints: 0,
      completedQuizzes: 0
    };
  }
  
  const totalScore = results.reduce((sum, result) => sum + result.score.percentage, 0);
  const totalPoints = results.reduce((sum, result) => sum + result.score.points, 0);
  
  return {
    totalQuizzes: results.length,
    averageScore: Math.round(totalScore / results.length),
    totalPoints: totalPoints,
    completedQuizzes: results.length
  };
};