// data/classes.js
import { getClassByCode } from '../utils/sharedClasses'; // ✅ Fixed import

// This function returns available classes from localStorage
export const getAvailableClasses = () => {
  const savedClasses = JSON.parse(localStorage.getItem('allClasses') || '[]');
  const classObj = {};
  
  savedClasses.forEach(cls => {
    classObj[cls.code] = {
      name: cls.name,
      schedule: cls.schedule || 'To be announced',
      instructor: cls.instructor || 'Instructor',
      description: cls.description || ''
    };
  });
  
  return classObj;
};

// This function returns quizzes for specific classes
export const getClassQuizzes = () => {
  const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
  const quizObj = {};
  
  // Group quizzes by class
  quizzes.forEach(quiz => {
    if (quiz.status === 'assigned') {
      const classCode = getClassCodeByName(quiz.class);
      if (classCode) {
        if (!quizObj[classCode]) {
          quizObj[classCode] = [];
        }
        
        // Calculate due status
        let status = 'upcoming';
        let dueText = 'No due date';
        
        if (quiz.scheduleDate) {
          const dueDate = new Date(quiz.scheduleDate);
          const today = new Date();
          const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            status = 'missing';
            dueText = 'Overdue';
          } else if (diffDays === 0) {
            dueText = 'Today';
          } else if (diffDays === 1) {
            dueText = 'Tomorrow';
          } else if (diffDays <= 7) {
            dueText = `In ${diffDays} days`;
          } else {
            dueText = dueDate.toLocaleDateString();
          }
        }
        
        quizObj[classCode].push({
          id: quiz.id,
          name: quiz.title,
          class: quiz.class,
          due: dueText,
          status: status,
          points: quiz.points,
          instructions: quiz.instructions,
          timer: quiz.timerMinutes,
          topic: quiz.topic
        });
      }
    }
  });
  
  return quizObj;
};

// Helper function to get class code from class name
const getClassCodeByName = (className) => {
  const classes = JSON.parse(localStorage.getItem('allClasses') || '[]');
  const foundClass = classes.find(cls => cls.name === className);
  return foundClass ? foundClass.code : null;
};

// Get quizzes for specific class codes
export const getQuizzesForClasses = (classCodes) => {
  const allQuizzes = getClassQuizzes();
  let quizzes = [];
  
  classCodes.forEach(code => {
    if (allQuizzes[code]) {
      quizzes = [...quizzes, ...allQuizzes[code]];
    }
  });
  
  return quizzes;
};

// Export availableClasses for backward compatibility
export const availableClasses = getAvailableClasses();

// Export classQuizzes for backward compatibility  
export const classQuizzes = getClassQuizzes();