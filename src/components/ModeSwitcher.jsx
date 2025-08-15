import React from 'react';
import { Book, Brain, Zap } from 'lucide-react';

const ModeSwitcher = ({ currentMode, setCurrentMode }) => {
  const modes = [
    { mode: "learn", icon: Book, label: "学习模式" },
    { mode: "quiz", icon: Brain, label: "选择题" },
    { mode: "spelling", icon: Zap, label: "拼写练习" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-lg">
          <div className="flex gap-2">
            {modes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentMode === mode
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcher;
