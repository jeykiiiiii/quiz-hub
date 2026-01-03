import { MdAssignment } from "react-icons/md";
import { IoIosClose, IoMdArrowDropdown } from "react-icons/io";
import { Menu } from "@headlessui/react";
import { useState } from "react";
import ScheduleModal from "./ScheduleModal";

import defaultMenuLinks from "../data/menuLinks";

export default function QuizHeader({ menuLinks = defaultMenuLinks, onSelect = () => {}, assignEnabled = false, onAssign = () => {} }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const items = (menuLinks || []).map((link) =>
    typeof link === "string" ? { id: link.toLowerCase().replace(/\s+/g, "-"), label: link } : link
  );

  function handleItemClick(item) {
    if (item.id === 'schedule') {
      setScheduleOpen(true);
      return;
    }
    onSelect(item);
  }

  return (
    <header className="bg-black text-white p-2 flex items-center gap-4">
      <div className="flex items-center gap-4">
        <button aria-label="Close quiz" className="hover:bg-orange-400 rounded-full p-1 cursor-pointer">
          <IoIosClose className="text-4xl" aria-hidden="true" />
        </button>
        <MdAssignment className="text-3xl" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Quiz</h1>
      </div>

      <div className="ml-auto flex items-center">
        <button
          aria-label="Assign quiz"
          onClick={() => assignEnabled && onAssign()}
          className={`text-xl h-9 w-24 rounded-l-full px-3 flex items-center justify-center ${assignEnabled ? 'bg-orange-400 cursor-pointer' : 'bg-[#111111] cursor-not-allowed'}`}
        >
          Assign
        </button>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button
            aria-label="Open assign menu"
            className="inline-flex w-full justify-center gap-x-1.5 rounded-r-full bg-orange-400 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer"
          >
            <IoMdArrowDropdown className="text-xl" aria-hidden="true" />
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-white/10 focus:outline-none">
            <div className="py-1">
              {items.map((item) => (
                <Menu.Item key={item.id}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`block px-4 py-2 text-sm text-white hover:bg-gray-600 hover:text-white w-full text-left ${active ? "bg-gray-700" : ""}`}
                    >
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Menu>
      </div>
      <ScheduleModal
        open={scheduleOpen}
        initialValue={scheduleDateTime}
        onClose={() => setScheduleOpen(false)}
        onSave={(val) => {
          setScheduleDateTime(val);
          setScheduleOpen(false);
          onSelect({ id: 'schedule', label: 'Schedule', value: val });
        }}
      />
    </header>
  );
}
