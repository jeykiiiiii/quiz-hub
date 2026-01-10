// src/utils/sharedClasses.js

// Initialize or get all classes (shared between teacher and student)
export const getSharedClasses = () => {
  let allClasses = JSON.parse(localStorage.getItem('allClasses') || '[]');
  
  // If no classes exist, create some default ones
  if (allClasses.length === 0) {
    allClasses = [
      { 
        code: 'DCIT26', 
        name: 'DCIT - 26', 
        schedule: 'Mon-Wed-Fri 9:00 AM', 
        instructor: 'Edan Belgica',
        description: 'Introduction to Programming',
        createdBy: 'system'
      },
      { 
        code: 'COSC101', 
        name: 'COSC - 101', 
        schedule: 'Tue-Thu 10:00 AM', 
        instructor: 'Ruffino Dela Cruz',
        description: 'Data Structures and Algorithms',
        createdBy: 'system'
      },
      { 
        code: 'COSC75', 
        name: 'COSC - 75', 
        schedule: 'Mon-Wed 2:00 PM', 
        instructor: 'Joshua Salceda',
        description: 'Database Management Systems',
        createdBy: 'system'
      }
    ];
    
    localStorage.setItem('allClasses', JSON.stringify(allClasses));
  }
  
  return allClasses;
};

// Add a class to shared storage
export const addSharedClass = (classData) => {
  const allClasses = getSharedClasses();
  
  // Check if class already exists
  const existingIndex = allClasses.findIndex(cls => cls.code === classData.code);
  
  if (existingIndex === -1) {
    allClasses.push(classData);
  } else {
    // Update existing class
    allClasses[existingIndex] = { ...allClasses[existingIndex], ...classData };
  }
  
  localStorage.setItem('allClasses', JSON.stringify(allClasses));
  return true;
};

// Get class by code
export const getClassByCode = (code) => {
  const allClasses = getSharedClasses();
  return allClasses.find(cls => cls.code === code.toUpperCase());
};

// Get classes created by teacher
export const getTeacherClasses = () => {
  const allClasses = getSharedClasses();
  return allClasses.filter(cls => cls.createdBy === 'teacher');
};

// Remove class from shared storage
export const removeSharedClass = (code) => {
  const allClasses = getSharedClasses();
  const updatedClasses = allClasses.filter(cls => cls.code !== code);
  localStorage.setItem('allClasses', JSON.stringify(updatedClasses));
  return updatedClasses;
};