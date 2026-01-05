// components/CreateQuizModal.js
import React, { useState } from 'react';
import { availableClasses } from '../../data/classes';

function CreateQuizModal({ show, onClose, onJoin }) {
  const [classCode, setClassCode] = useState('');

  if (!show) return null;

  return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-xl w-full max-w-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Create Class</h2>
                </div>
        
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 font-medium">Class code</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="Enter class code (e.g., COSC101, DCIT26)"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-2"
                      required
                    />
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>To create <b>a class code</b></p>
                      <p>• Use an authorized account</p>
                      <p>• Use 5-8 letters or numbers, and no spaces or symbols</p>
                      <p className="mt-2 font-medium text-orange-400">Available class codes:</p>
                      {Object.entries(availableClasses).map(([code, classData]) => (
                        <p key={code}>• {code} ({classData.name})</p>
                      ))}
                    </div>
                  </div>
        
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setClassCode('');
                        onClose();
                      }}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
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
export default CreateQuizModal;