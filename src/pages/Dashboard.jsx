import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import JoinClassModal from '../components/JoinClassModal';
import { availableClasses } from '../data/classes';

function Dashboard({ setIsAuthenticated }) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null); // ✅ NEW

  // Load classes from localStorage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('joinedClasses');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
  }, []);

  const handleJoinClass = (classCode) => {
    const alreadyEnrolled = classes.some(cls => cls.code === classCode);

    if (!alreadyEnrolled) {
      const classData = availableClasses[classCode];
      const newClass = {
        code: classCode,
        name: classData.name,
        schedule: classData.schedule,
        instructor: classData.instructor,
      };

      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
    } else {
      alert(`You are already enrolled in class with code: ${classCode}`);
    }
  };

  const handleRemoveClass = (codeToRemove) => {
    const updatedClasses = classes.filter(cls => cls.code !== codeToRemove);
    setClasses(updatedClasses);
    localStorage.setItem('joinedClasses', JSON.stringify(updatedClasses));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        setIsAuthenticated={setIsAuthenticated}
        onJoinClassClick={() => setShowJoinModal(true)}
      />

      <div className="container mx-auto px-4 py-8">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Total Quizzes
            </h3>
            <p className="text-4xl font-bold">0</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Active Classes
            </h3>
            <p className="text-4xl font-bold">{classes.length}</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Average Score
            </h3>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>

        {/* ================= YOUR CLASSES ================= */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedClass ? 'Class Overview' : 'Your Classes'}
            </h2>

            {!selectedClass && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
              >
                <span className="text-xl">+</span>
                <span>Join Class</span>
              </button>
            )}
          </div>

          {/* ========== CLASS VIEW ========== */}
          {selectedClass ? (
            <div>
              {/* Back button */}
              <button
                onClick={() => setSelectedClass(null)}
                className="mb-4 text-sm text-gray-400 hover:text-white"
              >
                ← Back to Classes
              </button>

              {/* Class banner */}
              <div className="bg-orange-600 text-black rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedClass.name}
                </h2>
                <p>{selectedClass.code}</p>
              </div>

              {/* Quiz list (placeholder for now) */}
              <div className="space-y-4">
                <div className="border border-gray-700 rounded-lg p-4 flex justify-between">
                  <div>
                    <p className="font-semibold">Quiz 1</p>
                    <span className="text-blue-400 text-sm">link</span>
                  </div>
                  <p className="text-gray-400">Dec 9</p>
                </div>

                <div className="border border-gray-700 rounded-lg p-4 flex justify-between">
                  <div>
                    <p className="font-semibold">Quiz 2</p>
                    <span className="text-blue-400 text-sm">link</span>
                  </div>
                  <p className="text-gray-400">Dec 1</p>
                </div>
              </div>
            </div>
          ) : classes.length === 0 ? (
            /* ========== EMPTY STATE ========== */
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                You haven't joined any classes yet.
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold transition"
              >
                <span className="text-2xl">+</span>
                <span>Join Your First Class</span>
              </button>
            </div>
          ) : (
            /* ========== CLASS GRID ========== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {classes.map((classItem, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-gray-400">
                      {classItem.schedule}
                    </p>
                    <p className="text-gray-400">
                      {classItem.instructor}
                    </p>
                    <div className="text-sm text-orange-400 font-medium mt-2">
                      Code: {classItem.code}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleRemoveClass(classItem.code)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Leave Class
                    </button>

                    <button
                      onClick={() => setSelectedClass(classItem)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      View Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Class Modal */}
      <JoinClassModal
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}

export default Dashboard;
