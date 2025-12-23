// components/CreateClassCodeModal.js
import React, { useState } from 'react';
import { availableClasses, addCreatedClass, getCreatedClasses } from '../data/classes';

function CreateClassCodeModal({ show, onClose, onJoin }) {
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [schedule, setSchedule] = useState('');

  const generateClassCode = () => {
    const chars = 'ABCDEF123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setClassCode(code);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = classCode.trim().toUpperCase();
    
    if (!code) {
      alert('Please generate or enter a class code.');
      return;
    }

    if (!className.trim()) {
      alert('Please enter a class name.');
      return;
    }
    
    // Check if code already exists in available or created classes
    const createdClasses = getCreatedClasses();
    const codeExists = availableClasses[code] || createdClasses.some(cls => cls.code === code);
    
    if (codeExists) {
      alert(`Class code "${code}" already exists.`);
      return;
    }
    
    // Create the new class with generated code
    addCreatedClass(code, className.trim(), schedule.trim(), instructor.trim());
    
    // Reset form
    setClassCode('');
    setClassName('');
    setSchedule('');
    setInstructor('');
    onClose();
  };

  if (!show) return null;

  return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-xl w-full max-w-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Create Class</h2>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                    <p>Generate a random code or make a custom one. Fill in the class details below.</p>
                </div>

                  <div className="flex justify-end gap-3"></div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 font-medium">Class code</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        placeholder="Auto-generated code (e.g., A1B2C3)"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-3"
                      />
                      <button
                        type="button"
                        onClick={generateClassCode}
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded font-medium transition"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 font-medium">Class name</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                      }}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                        onClick={() => {
                        setClassCode('');
                        onClose();
                      }}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition font-medium"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
  );
}
export default CreateClassCodeModal;