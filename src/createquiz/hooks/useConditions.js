import { useState } from 'react';

export function useConditions(initial = {}) {
  const [points, setPoints] = useState(initial.points ?? 100);
  const [unmarked, setUnmarked] = useState(initial.unmarked ?? false);
  const [timerMinutes, setTimerMinutes] = useState(initial.timerMinutes ?? 30);
  const [noTimer, setNoTimer] = useState(initial.noTimer ?? false);
  const [scheduleDate, setScheduleDate] = useState(initial.scheduleDate || '');
  const [noDue, setNoDue] = useState(initial.noDue ?? false);
  const [topic, setTopic] = useState(initial.topic || '');
  const [noTopic, setNoTopic] = useState(initial.noTopic ?? false);
  const [closeAfterDue, setCloseAfterDue] = useState(initial.closeAfterDue ?? false);

  return {
    points,
    setPoints,
    unmarked,
    setUnmarked,
    timerMinutes,
    setTimerMinutes,
    noTimer,
    setNoTimer,
    scheduleDate,
    setScheduleDate,
    noDue,
    setNoDue,
    topic,
    setTopic,
    noTopic,
    setNoTopic,
    closeAfterDue,
    setCloseAfterDue,
  };
}

export default useConditions;
