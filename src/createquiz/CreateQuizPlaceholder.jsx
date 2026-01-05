import QuizHeader from './components/QuizHeader';
import Menu from '../components/instructor/Menu';
import QuizBody from '../components/instructor/QuizBody';
import useQuiz from './hooks/useQuiz';
import useConditions from './hooks/useConditions';
import useAssign from './hooks/useAssign';

export default function CreateQuizPlaceholder() {
  const { title, setTitle, instructions, setInstructions, questions, setQuestions } = useQuiz();

  const conditions = useConditions();

  const { assignEnabled, onAssign } = useAssign({
    title,
    instructions,
    questions,
    conditions,
  });

  return (
    <>
      <QuizHeader assignEnabled={assignEnabled} onAssign={onAssign} />
      <div className="h-screen bg-black flex">
        <Menu {...conditions} />
        <QuizBody
          title={title}
          setTitle={setTitle}
          instructions={instructions}
          setInstructions={setInstructions}
          questions={questions}
          setQuestions={setQuestions}
        />
      </div>
    </>
  );
}
