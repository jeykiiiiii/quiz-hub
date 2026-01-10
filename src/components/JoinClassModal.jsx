import React, { useState } from 'react';
import { getClassByCode } from '../utils/sharedClasses';

function JoinClassModal({ show, onClose, onJoin }) {
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleJoin = async () => {
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    setIsLoading(true);
    setError('');

    // Check if class exists
    const classData = getClassByCode(classCode);
    
    if (!classData) {
      setError('Class code not found. Please check the code and try again.');
      setIsLoading(false);
      return;
    }

    try {
      await onJoin(classCode.toUpperCase());
      setClassCode('');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setClassCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold mb-2">Join Class</h3>
        <p className="text-gray-400 mb-6">
          Enter the class code provided by your instructor
        </p>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Class Code</label>
          <input
            type="text"
            value={classCode}
            onChange={(e) => {
              setClassCode(e.target.value.toUpperCase());
              setError('');
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., DCIT26"
            maxLength="10"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            The class code is usually 6 characters (letters and numbers)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={isLoading || !classCode.trim()}
            className={`flex-1 px-4 py-3 rounded-lg transition ${
              isLoading || !classCode.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? 'Joining...' : 'Join Class'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinClassModal;