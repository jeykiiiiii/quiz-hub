import { PiStudent } from "react-icons/pi";
import { useState } from "react";

export default function Menu({
    points = 100,
    setPoints = () => {},
    unmarked = false,
    setUnmarked = () => {},
    noDue = false,
    setNoDue = () => {},
    noTopic = false,
    setNoTopic = () => {},
    noTimer = false,
    setNoTimer = () => {},
    timerMinutes = 30,
    setTimerMinutes = () => {},
    scheduleDate = '',
    setScheduleDate = () => {},
    topic = '',
    setTopic = () => {},
    closeAfterDue = false,
    setCloseAfterDue = () => {},
}) {

    const Toggle = ({ checked, onChange, label }) => (
        <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-400" />
            <span>{label}</span>
        </label>
    );

    return (
        <div className="w-[300px] bg-black p-5 text-white/85 text-sm">
            <div className="flex flex-col gap-2 mb-3">
                <p>Class</p>
                <input type="text" placeholder="DCIT 26" readOnly className="border border-white/85 w-full p-2 rounded-md"/>
            </div>

                <div className="flex flex-col gap-2 mb-3">
                    <p>Assign to</p>
                    <button className="mt-2 flex items-center justify-center gap-2 border border-white/85 w-full p-2 rounded-full cursor-pointer hover:bg-white/20">
                        <PiStudent />
                        All students
                    </button>
                </div>
            
            <div className="flex gap-2 mb-5">
                <div className="flex flex-col gap-2 mb-3">
                    <p>Points</p>
                    <input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value || 0))} className="border border-white/85 p-2 w-20 rounded-md hover:bg-white/20" disabled={unmarked} />
                    <Toggle checked={unmarked} onChange={(e) => setUnmarked(e.target.checked)} label="Unmarked" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="timer-minutes" className="text-sm">Timer (minutes)</label>
                    <input
                        id="timer-minutes"
                        type="number"
                        min={1}
                        step={1}
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value || 0)))}
                        aria-label="Timer in minutes"
                        className="border border-white/85 p-2 rounded-md hover:bg-white/20 w-20"
                        disabled={noTimer}
                    />
                    <Toggle checked={noTimer} onChange={(e) => setNoTimer(e.target.checked)} label="No timer" />
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-3">
                <p>Schedule</p>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="border border-white/85 w-full p-2 rounded-md hover:bg-white/20" disabled={noDue} />
                <Toggle checked={noDue} onChange={(e) => setNoDue(e.target.checked)} label="No due date" />
            </div>

            <div className="flex flex-col gap-2 mb-3">
                <p>Topic</p>
                <input type="text" placeholder="Add topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="border border-white/85 w-full p-2 rounded-md hover:bg-white/20" disabled={noTopic} />
                <Toggle checked={noTopic} onChange={(e) => setNoTopic(e.target.checked)} label="No topic" />
            </div>

                        <div className="flex flex-col">
                                <Toggle checked={closeAfterDue} onChange={(e) => setCloseAfterDue(e.target.checked)} label="Close submissions after due date" />
                        </div>
    </div>
  );
}
