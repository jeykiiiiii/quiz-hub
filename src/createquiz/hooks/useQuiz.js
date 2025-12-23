import { useState } from 'react';

export function useQuiz(initial = {}) {
  const [title, setTitle] = useState(initial.title || '');
  const [instructions, setInstructions] = useState(initial.instructions || '');
  const [questions, setQuestions] = useState(initial.questions || []);

  return {
    title,
    setTitle,
    instructions,
    setInstructions,
    questions,
    setQuestions,
  };
}

export default useQuiz;
