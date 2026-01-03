import { useState } from "react";

export default function QuestionCreator({ onAdd }) {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("short-answer");
  const [options, setOptions] = useState([""]);
  const [answerKey, setAnswerKey] = useState("");

  function addOption() {
    setOptions((s) => [...s, ""]);
  }

  function removeOption(idx) {
    setOptions((s) => s.filter((_, i) => i !== idx));
  }

  function setOptionValue(idx, value) {
    setOptions((s) => s.map((o, i) => (i === idx ? value : o)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    const payload = {
      id: Date.now(),
      text: question.trim(),
      type,
      options: type === "multiple-choice" ? options.filter(Boolean) : [],
      answerKey: type === "short-answer" ? (answerKey.trim() || null) : null,
    };
    onAdd?.(payload);
    setQuestion("");
    setType("short-answer");
    setOptions([""]);
    setAnswerKey("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-[#0f1724] rounded-md">
      <div className="mb-3">
        <label className="block text-sm text-gray-200 mb-1">Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Add question"
          className="w-full p-2 rounded bg-white text-black border"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-200 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 rounded bg-white text-black border"
        >
          <option value="short-answer">Short answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="multiple-choice">Multiple choice</option>
        </select>
      </div>

      {type === "multiple-choice" && (
        <div className="mb-3">
          <label className="block text-sm text-gray-200 mb-1">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
              <input
                value={opt}
                onChange={(e) => setOptionValue(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1 p-2 rounded bg-white text-black border"
              />
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="px-2 py-1 bg-red-500 rounded text-white"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="mt-2 px-3 py-1 bg-green-600 rounded text-white"
          >
            Add option
          </button>
        </div>
      )}

      {type === "short-answer" && (
        <div className="mb-3">
          <label className="block text-sm text-gray-200 mb-1">Answer key (optional)</label>
          <input
            value={answerKey}
            onChange={(e) => setAnswerKey(e.target.value)}
            placeholder="Expected answer"
            className="w-full p-2 rounded bg-white text-black border"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 rounded text-white" type="submit">
          Add Question
        </button>
      </div>
    </form>
  );
}
