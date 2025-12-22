export const availableClasses = {
  "ABCDE": { 
    name: "Subject A", 
    schedule: "Mon-Wed 10-11", 
    instructor: "Prof. Smith"
  },
  "ABCDEFG": { 
    name: "Subject B", 
    schedule: "Tue-Thu 2-3", 
    instructor: "Prof. Johnson"
  },
  "MATH101": { 
    name: "Subject C", 
    schedule: "MWF 9-10", 
    instructor: "Dr. Lee"
  },
  "SCI202": { 
    name: "Subject D", 
    schedule: "TTH 1-2", 
    instructor: "Dr. Garcia"
  },
  
  "COSC101": { 
    name: "COSC - 101", 
    schedule: "3 - 2", 
    instructor: "Ruffino Dela Cruz"
  },
  "DCIT26": { 
    name: "DCIT - 26", 
    schedule: "3 - 2", 
    instructor: "Edan Belgica"
  },
  "COSC75": { 
    name: "COSC - 75", 
    schedule: "3 - 2", 
    instructor: "Joshua Salceda"
  }
};

export const classQuizzes = {
  "COSC101": [
    { id: 2, name: "Quiz 2", class: "COSC 101", due: "Tomorrow, 11:59 PM", status: "upcoming" }
  ],
  "DCIT26": [
    { id: 1, name: "Quiz 1", class: "DCIT 26", due: "Today, 11:59 PM", status: "missing" }
  ],
  "COSC75": [
    { id: 3, name: "Quiz 3", class: "COSC 75", due: "Thursday, Jan 15, 2026, 11:59 PM", status: "upcoming" }
  ]
};

export const getQuizzesForClasses = (classCodes) => {
  let quizzes = [];
  classCodes.forEach(code => {
    if (classQuizzes[code]) {
      quizzes = [...quizzes, ...classQuizzes[code]];
    }
  });
  return quizzes;
};