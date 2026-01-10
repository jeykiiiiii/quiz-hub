// utils/quizGrading.js

// Get all quiz submissions for a specific quiz - FIXED VERSION
export const getQuizSubmissions = (quizId) => {
  try {
    console.log('getQuizSubmissions called with quizId:', quizId, 'type:', typeof quizId);
    
    const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    console.log('Total results in storage:', allResults.length);
    
    // Convert quizId to string for comparison
    const searchId = quizId?.toString();
    
    // Multiple matching strategies
    const submissions = allResults.filter(result => {
      const resultQuizId = result.quizId?.toString();
      
      // Debug logging
      if (resultQuizId) {
        console.log(`Comparing: result.quizId="${resultQuizId}" (${typeof result.quizId}) vs searchId="${searchId}" (${typeof quizId})`);
      }
      
      // Try multiple matching strategies
      return (
        resultQuizId === searchId ||                    // Exact string match
        parseInt(resultQuizId) === parseInt(searchId) || // Numeric match
        result.quizId === quizId                        // Direct match
      );
    });
    
    console.log(`Found ${submissions.length} submissions for quiz ${quizId}`);
    console.log('Submissions found:', submissions);
    
    return submissions;
  } catch (error) {
    console.error('Error in getQuizSubmissions:', error);
    return [];
  }
};

// Get all students who have submitted a quiz
export const getQuizSubmissionsByClass = (className) => {
  const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  return allResults.filter(result => result.class === className);
};

// Release scores for a specific quiz - FIXED VERSION
export const releaseQuizScores = (quizId) => {
  try {
    console.log('releaseQuizScores called for quizId:', quizId);
    
    const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    const searchId = quizId?.toString();
    
    const updatedResults = allResults.map(result => {
      const resultQuizId = result.quizId?.toString();
      
      // Check if this result belongs to the quiz
      const isMatch = (
        resultQuizId === searchId ||
        parseInt(resultQuizId) === parseInt(searchId)
      );
      
      if (isMatch) {
        console.log(`Releasing score for student: ${result.studentName || result.studentEmail}`);
        return {
          ...result,
          scoreReleased: true,
          releasedAt: new Date().toISOString()
        };
      }
      return result;
    });
    
    localStorage.setItem('studentQuizResults', JSON.stringify(updatedResults));
    console.log('Scores released successfully');
    return true;
  } catch (error) {
    console.error('Error in releaseQuizScores:', error);
    return false;
  }
};

// Release scores for a specific student's quiz
export const releaseStudentScore = (submission) => {
  try {
    const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    
    const updatedResults = allResults.map(result => {
      // Match by quizId AND studentEmail AND submittedAt
      const resultQuizId = result.quizId?.toString();
      const submissionQuizId = submission.quizId?.toString();
      
      const isMatch = (
        (resultQuizId === submissionQuizId || 
         parseInt(resultQuizId) === parseInt(submissionQuizId)) &&
        result.studentEmail === submission.studentEmail &&
        result.submittedAt === submission.submittedAt
      );
      
      if (isMatch) {
        console.log(`Releasing individual score for: ${result.studentName || result.studentEmail}`);
        return {
          ...result,
          scoreReleased: true,
          releasedAt: new Date().toISOString()
        };
      }
      return result;
    });
    
    localStorage.setItem('studentQuizResults', JSON.stringify(updatedResults));
    return true;
  } catch (error) {
    console.error('Error in releaseStudentScore:', error);
    return false;
  }
};

// Check if scores are released for a quiz
export const areScoresReleased = (quizId) => {
  const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  const searchId = quizId?.toString();
  
  const quizResults = allResults.filter(result => {
    const resultQuizId = result.quizId?.toString();
    return (
      resultQuizId === searchId ||
      parseInt(resultQuizId) === parseInt(searchId)
    );
  });
  
  if (quizResults.length === 0) return false;
  return quizResults.some(result => result.scoreReleased);
};

// Get student's result for a quiz (with score if released)
export const getStudentQuizResult = (quizId, studentEmail) => {
  try {
    const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
    const searchId = quizId?.toString();
    const email = studentEmail || localStorage.getItem('studentEmail');
    
    const result = allResults.find(r => {
      const rQuizId = r.quizId?.toString();
      return (
        (rQuizId === searchId || parseInt(rQuizId) === parseInt(searchId)) &&
        r.studentEmail === email
      );
    });
    
    if (!result) return null;
    
    // Only return score if released
    if (!result.scoreReleased) {
      return {
        ...result,
        score: null,
        correctAnswers: null
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error in getStudentQuizResult:', error);
    return null;
  }
};

// Get student's submitted quizzes
export const getStudentSubmittedQuizzes = (studentEmail) => {
  const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  const email = studentEmail || localStorage.getItem('studentEmail');
  
  if (email) {
    return allResults.filter(result => result.studentEmail === email);
  }
  return allResults;
};

// Check if quiz is completed by student
export const isQuizCompleted = (quizId, studentEmail) => {
  const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  const searchId = quizId?.toString();
  const email = studentEmail || localStorage.getItem('studentEmail');
  
  return allResults.some(result => {
    const rQuizId = result.quizId?.toString();
    return (
      (rQuizId === searchId || parseInt(rQuizId) === parseInt(searchId)) &&
      result.studentEmail === email
    );
  });
};

// Get student statistics
export const getStudentStats = (studentEmail) => {
  const results = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  const email = studentEmail || localStorage.getItem('studentEmail');
  
  const studentResults = email ? results.filter(r => r.studentEmail === email) : results;
  const releasedResults = studentResults.filter(r => r.scoreReleased);
  
  if (releasedResults.length === 0) {
    return {
      totalQuizzes: studentResults.length,
      completedQuizzes: studentResults.length,
      averageScore: 0,
      totalPoints: 0,
      gradedQuizzes: 0
    };
  }
  
  const totalScore = releasedResults.reduce((sum, result) => sum + (result.score?.percentage || 0), 0);
  const totalPoints = releasedResults.reduce((sum, result) => sum + (result.score?.points || 0), 0);
  
  return {
    totalQuizzes: studentResults.length,
    completedQuizzes: studentResults.length,
    averageScore: Math.round(totalScore / releasedResults.length),
    totalPoints: totalPoints,
    gradedQuizzes: releasedResults.length
  };
};

// DEBUG FUNCTION: Check all quiz IDs in the system
export const debugQuizSubmissions = () => {
  console.log('=== DEBUG: CHECKING ALL QUIZ SUBMISSIONS ===');
  
  const allResults = JSON.parse(localStorage.getItem('studentQuizResults') || '[]');
  const teacherQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
  const assignedQuizzes = JSON.parse(localStorage.getItem('assignedQuizzes') || '[]');
  
  console.log('Total student submissions:', allResults.length);
  console.log('Total teacher quizzes:', teacherQuizzes.length);
  console.log('Total assigned quizzes:', assignedQuizzes.length);
  
  // Show all quiz IDs in student results
  console.log('\nQuiz IDs in student submissions:');
  allResults.forEach((result, index) => {
    console.log(`${index + 1}. Quiz ID: "${result.quizId}" (${typeof result.quizId}), Title: "${result.quizTitle}", Student: "${result.studentName || result.studentEmail}"`);
  });
  
  // Show all quiz IDs in teacher quizzes
  console.log('\nQuiz IDs in teacher quizzes:');
  teacherQuizzes.forEach((quiz, index) => {
    console.log(`${index + 1}. Quiz ID: "${quiz.id}" (${typeof quiz.id}), Title: "${quiz.title}", Status: "${quiz.status}"`);
  });
  
  // Check which quizzes have submissions
  console.log('\nMatching quizzes with submissions:');
  teacherQuizzes.forEach(quiz => {
    const submissions = getQuizSubmissions(quiz.id);
    console.log(`Quiz "${quiz.title}" (ID: ${quiz.id}): ${submissions.length} submissions`);
  });
  
  return {
    studentSubmissions: allResults,
    teacherQuizzes: teacherQuizzes,
    assignedQuizzes: assignedQuizzes
  };
};