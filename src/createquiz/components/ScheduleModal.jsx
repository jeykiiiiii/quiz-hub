import { useEffect, useState } from 'react';

export default function ScheduleModal({ open, initialValue = '', onClose, onSave }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(open ? (initialValue || '') : '');
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, initialValue, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-md bg-white text-black rounded-md shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Set schedule</h3>

        <label className="block text-sm mb-1" htmlFor="schedule-input">Date &amp; time</label>
        <input
          id="schedule-input"
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
          <button
            type="button"
            onClick={() => onSave(value)}
            className="px-3 py-1 rounded bg-blue-600 text-white"
            disabled={!value}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
