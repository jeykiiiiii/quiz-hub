// utils/classUtils.js
import { getSharedClasses } from './sharedClasses';

// Generate a random class code with letters and numbers
export const generateClassCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

// Check if a class code already exists
export const checkClassCodeExists = (code) => {
  const allClasses = getSharedClasses();
  return allClasses.some(cls => cls.code === code);
};

// Get unique class code
export const getUniqueClassCode = () => {
  let code;
  let attempts = 0;
  
  do {
    code = generateClassCode();
    attempts++;
    
    // Safety check to prevent infinite loop
    if (attempts > 100) {
      code = generateClassCode() + Date.now().toString().slice(-4);
      break;
    }
  } while (checkClassCodeExists(code));
  
  return code;
};

// Get teacher name (in real app, get from auth)
export const getTeacherName = () => {
  return 'Instructor'; // Default name
};

// ✅ If you need getClassByCode in classUtils.js too, add it:
export const getClassByCodeFromUtils = (code) => {
  const allClasses = getSharedClasses();
  return allClasses.find(cls => cls.code === code.toUpperCase());
};