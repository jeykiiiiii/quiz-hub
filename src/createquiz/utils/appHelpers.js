export function isAssignEnabled(title, questions) {
  return typeof title === 'string' && title.trim() !== '' && Array.isArray(questions) && questions.length > 0;
}

export function buildPayload({
  title,
  instructions,
  points,
  unmarked,
  timerMinutes,
  noTimer,
  scheduleDate,
  noDue,
  topic,
  noTopic,
  closeAfterDue,
  questions,
}) {
  return {
    title: (title || '').trim(),
    instructions,
    conditions: {
      points: unmarked ? null : points,
      unmarked,
      timerMinutes: noTimer ? null : timerMinutes,
      scheduleDate: noDue ? null : scheduleDate,
      topic: noTopic ? null : topic,
      closeAfterDue,
    },
    questions,
    exportedAt: new Date().toISOString(),
  };
}

export function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function handleAssign(params) {
  const { title, questions } = params;
  if (!isAssignEnabled(title, questions)) return;
  const payload = buildPayload(params);
  const filename = `${(title || 'quiz').replace(/\s+/g, '_')}.json`;
  downloadJSON(filename, payload);
}
