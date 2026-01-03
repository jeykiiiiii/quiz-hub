import { useRef, useState, useEffect } from "react";
import { BsTypeBold, BsTypeItalic } from "react-icons/bs";
import { BiUnderline } from "react-icons/bi";
import QuestionCreator from "./QuestionCreator.jsx";

export default function QuizBody({ title, setTitle, instructions, setInstructions, questions, setQuestions }) {
    const instructionsRef = useRef(null);
    const [focused, setFocused] = useState(false);

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    useEffect(() => {
        if (instructionsRef.current) {
        instructionsRef.current.innerHTML = instructions;
        }
    }, [instructions]);

    function updateToolbarState() {
        setIsBold(document.queryCommandState("bold"));
        setIsItalic(document.queryCommandState("italic"));
        setIsUnderline(document.queryCommandState("underline"));
    }

    function applyFormat(command) {
        const el = instructionsRef.current;
        if (!el) return;
        el.focus();
        document.execCommand(command);
        updateToolbarState();
    }

    function handleBlur() {
        const el = instructionsRef.current;
        setInstructions(el.innerHTML);
        setFocused(false);
    }

    function addQuestion(q) {
        setQuestions((s) => [...s, q]);
    }

    function removeQuestion(id) {
        setQuestions((s) => s.filter((q) => q.id !== id));
    }

    return (
        <div className="p-6 bg-[#111111] w-full text-white overflow-auto rounded-xl mr-5 mb-5">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-1">Title</label>
                <input
                className="w-full bg-gray-100 text-black rounded-sm p-3 border border-gray-300"
                placeholder="Add title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
                <div className="text-xs text-gray-400 mt-1">*Required</div>
            </div>

            <div>
                <div className="text-sm text-gray-200 mb-2">Instructions (optional)</div>

                <div className="mb-2 flex gap-2 text-gray-600">
                    <button
                        type="button"
                        aria-label="bold"
                        onClick={() => applyFormat("bold")}
                        className={`p-2 rounded hover:bg-gray-200 ${
                        isBold ? "bg-gray-300" : ""
                        }`}
                    >
                        <BsTypeBold />
                    </button>

                    <button
                        type="button"
                        aria-label="italic"
                        onClick={() => applyFormat("italic")}
                        className={`p-2 rounded hover:bg-gray-200 ${
                        isItalic ? "bg-gray-300" : ""
                        }`}
                    >
                        <BsTypeItalic />
                    </button>

                    <button
                        type="button"
                        aria-label="underline"
                        onClick={() => applyFormat("underline")}
                        className={`p-2 rounded hover:bg-gray-200 ${
                        isUnderline ? "bg-gray-300" : ""
                        }`}
                    >
                        <BiUnderline />
                    </button>
                </div>

                <div className="relative">
                    {!focused && !instructions && (
                        <div
                        onClick={() => instructionsRef.current?.focus()}
                        className="absolute inset-0 pointer-events-auto text-gray-400 p-4"
                        >
                        Add instructions for students
                        </div>
                    )}

                    <div
                        ref={instructionsRef}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setFocused(true)}
                        onBlur={handleBlur}
                        onKeyUp={updateToolbarState}
                        onMouseUp={updateToolbarState}
                        className="w-full min-h-40 rounded-md p-4 border border-gray-200 bg-white text-black text-left whitespace-pre-wrap"
                        style={{ direction: "ltr" }}
                    />
                </div>
                <QuestionCreator onAdd={addQuestion} />

                {questions.length > 0 && (
                    <div className="mt-4">
                        <div className="text-sm text-gray-200 mb-2">Questions</div>
                        <ul className="space-y-2">
                            {questions.map((q) => (
                                <li key={q.id} className="p-3 bg-gray-800 rounded">
                                    <div className="text-white text-wrap">{q.text}</div>
                                    <div className="text-xs text-gray-400">{q.type}</div>
                                    {q.answerKey && (
                                        <div className="text-xs text-green-400 mt-1">Answer: {q.answerKey}</div>
                                    )}
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(q.id)}
                                            className="px-2 py-1 bg-red-600 rounded text-white text-sm"
                                        >
                                            Remove question
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
