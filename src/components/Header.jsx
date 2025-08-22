import React from "react";
import { Brain, Target, Trophy, Star } from "lucide-react";
import ModeSwitcher from "./ModeSwitcher";


const Header = ({ studyStats, dailyGoal, currentMode, setCurrentMode }) => {

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">AI背单词</h1>
          </div>

          

          <ModeSwitcher currentMode={currentMode} setCurrentMode={setCurrentMode} />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>今日 {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="w-4 h-4" />
                <span>连续: {studyStats.streakDays}天</span>
              </div>
              {currentMode !== 'learn' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>正确率: {studyStats.accuracy}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
