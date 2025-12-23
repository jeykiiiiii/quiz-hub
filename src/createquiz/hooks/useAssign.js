import { isAssignEnabled, handleAssign as handleAssignHelper } from '../utils/appHelpers';

export function useAssign({ title, instructions, questions, conditions }) {
  const assignEnabled = isAssignEnabled(title, questions);

  const onAssign = () => {
    handleAssignHelper({
      title,
      instructions,
      questions,
      ...conditions,
    });
  };

  return { assignEnabled, onAssign };
}

export default useAssign;
