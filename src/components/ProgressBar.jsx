import React from "react";

const ProgressBar = ({ currentWordIndex, totalWords }) => {
  return (
    <div className="max-w-2xl mx-auto mb-6 mt-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">学习进度</span>
          <span className="text-sm font-medium text-gray-800">
            {currentWordIndex + 1} / {totalWords}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${((currentWordIndex + 1) / totalWords) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
