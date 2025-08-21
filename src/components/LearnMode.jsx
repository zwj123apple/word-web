import React from "react";
import { Volume2 } from "lucide-react";

const LearnMode = ({ currentWord, speakWord, markFamiliarity }) => {
  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {currentWord.word}
          </h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-xl text-gray-500">
              {currentWord.phonetic}
            </span>
            <button
              onClick={() => speakWord(currentWord.word)}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            >
              <Volume2 className="w-6 h-6 text-blue-600" />
            </button>
          </div>

          <div className="text-2xl font-medium text-gray-700 mb-2">
            {currentWord.translation}
          </div>

          <div className="text-lg text-blue-600 mb-6">
            {currentWord.example}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {currentWord.tag}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => markFamiliarity(0)}
            className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium"
          >
            不认识
          </button>
          <button
            onClick={() => markFamiliarity(2)}
            className="px-6 py-3 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-colors font-medium"
          >
            模糊
          </button>
          <button
            onClick={() => markFamiliarity(4)}
            className="px-6 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors font-medium"
          >
            认识
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnMode;
