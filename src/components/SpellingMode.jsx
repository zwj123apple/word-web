import React from 'react';
import { Volume2 } from 'lucide-react';

const SpellingMode = ({
  currentWord,
  userAnswer,
  setUserAnswer,
  showAnswer,
  setShowAnswer,
  nextWord,
  speakWord,
  recordAnswer,
}) => {
  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">听音拼写</h2>

          <div className="mb-8">
            <button
              onClick={() => speakWord(currentWord.word)}
              className="p-6 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors mb-6"
            >
              <Volume2 className="w-8 h-8 text-blue-600" />
            </button>

            <div className="text-xl text-gray-600 mb-4">
              {currentWord.translation}
            </div>
            <div className="text-lg text-blue-500">
              {currentWord.definition}
            </div>
          </div>

          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="请输入单词拼写"
            className="w-full p-4 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none mb-6"
          />

          {showAnswer && (
            <div className="mb-6">
              <div
                className={`text-2xl font-bold mb-4 ${
                  userAnswer.toLowerCase() === currentWord.word.toLowerCase()
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {userAnswer.toLowerCase() === currentWord.word.toLowerCase()
                  ? "✓ 正确！"
                  : "✗ 错误"}
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {currentWord.word}
              </div>
              <div className="text-gray-500 mt-2">{currentWord.phonetic}</div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {!showAnswer ? (
              <button
                onClick={() => {
                  setShowAnswer(true);
                  const isCorrect = userAnswer.toLowerCase() === currentWord.word.toLowerCase();
                  recordAnswer(isCorrect);
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                检查答案
              </button>
            ) : (
              <button
                onClick={() => {
                  nextWord();
                  setShowAnswer(false);
                  setUserAnswer("");
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                下一题
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellingMode;
