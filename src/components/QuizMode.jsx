import React from 'react';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';

const QuizMode = ({
  currentWord,
  quizOptions,
  showResult,
  selectedOption,
  handleAnswerSubmit,
  nextWord,
  speakWord,
}) => {
  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            选择正确含义
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-blue-600">
              {currentWord.word}
            </h1>
            <button
              onClick={() => speakWord(currentWord.word)}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {quizOptions.map((option, index) => {
            let buttonClass =
              "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ";

            if (showResult) {
              if (option === currentWord.translation) {
                buttonClass += "border-green-500 bg-green-50 text-green-700";
              } else if (
                option === selectedOption &&
                option !== currentWord.translation
              ) {
                buttonClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else {
              buttonClass +=
                "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700";
            }

            return (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSubmit(option)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                selectedOption === currentWord.translation
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {selectedOption === currentWord.translation ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">答对了！</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">答错了</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {showResult ? (
            <button
              onClick={nextWord}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              下一题
            </button>
          ) : (
            <div className="text-gray-500">选择一个答案</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
