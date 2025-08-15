import React, { useState, useEffect, useCallback } from "react";
import {
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Target,
  Calendar,
  Trophy,
  Settings,
  Book,
  Brain,
  Star,
  Zap,
} from "lucide-react";
import cet4Data from "../data/cet4.json";
import cet6Data from "../data/cet6.json";
import gaokaoData from "../data/gaokao.json";

const VocabularyApp = () => {
  // 词库数据
  const wordBanks = {
    cet4: { name: "CET-4", count: 3849 },
    cet6: { name: "CET-6", count: 5407 },
    gaokao: { name: "gaokao", count: 3677 },
  };
  function shuffleArray(arr) {
    // 复制原数组，避免修改原数组
    const newArr = [...arr];

    // 从最后一个元素开始向前遍历
    for (let i = newArr.length - 1; i > 0; i--) {
      // 生成 [0, i] 之间的随机整数
      const j = Math.floor(Math.random() * (i + 1));

      // 交换元素（对象也可以直接交换）
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }

    return newArr;
  }

  // 精选词库数据
  const wordDatabase = {
    cet4: shuffleArray(cet4Data),
    cet6: shuffleArray(cet6Data),
    gaokao: shuffleArray(gaokaoData),
  };

  // 状态管理
  const [currentMode, setCurrentMode] = useState("learn");
  const [selectedBank, setSelectedBank] = useState("cet4");
  const [dailyGoal, setDailyGoal] = useState(30);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState(wordDatabase.cet4);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({
    todayLearned: 12,
    todayReviewed: 8,
    totalWords: 156,
    streakDays: 7,
    accuracy: 85,
  });
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const currentWord = words[currentWordIndex] || words[0];

  // 词库切换处理
  useEffect(() => {
    const newWords = wordDatabase[selectedBank] || wordDatabase.cet4;
    setWords(newWords);
    setCurrentWordIndex(0);
  }, [selectedBank]);

  // 文字转语音
  const speakWord = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // 生成测试选项
  const generateQuizOptions = useCallback(() => {
    if (!currentWord) return;

    const correctAnswer = currentWord.translation;
    const wrongOptions = words
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.translation)
      .slice(0, 3);

    const options = [correctAnswer, ...wrongOptions];
    setQuizOptions(options.sort(() => Math.random() - 0.5));
  }, [currentWord, words]);

  // 处理答题
  const handleAnswerSubmit = (answer) => {
    setSelectedOption(answer);
    setShowResult(true);

    const isCorrect = answer === currentWord.definition;

    // 更新单词熟悉度
    setWords((prev) =>
      prev.map((w) =>
        w.id === currentWord.id
          ? {
              ...w,
              familiarity: isCorrect
                ? w.familiarity + 1
                : Math.max(0, w.familiarity - 1),
            }
          : w
      )
    );

    // 更新统计数据
    setStudyStats((prev) => ({
      ...prev,
      todayLearned:
        currentMode === "learn" ? prev.todayLearned + 1 : prev.todayLearned,
      todayReviewed:
        currentMode === "quiz" ? prev.todayReviewed + 1 : prev.todayReviewed,
      accuracy: Math.round(prev.accuracy * 0.9 + (isCorrect ? 10 : 0)),
    }));
  };

  // 下一个单词
  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % words.length);
    setShowAnswer(false);
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswer("");
  };

  // 标记熟悉度
  const markFamiliarity = (level) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === currentWord.id ? { ...w, familiarity: level } : w
      )
    );
    nextWord();
  };

  // 初始化测试选项
  useEffect(() => {
    if (currentMode === "quiz" && words.length > 0) {
      generateQuizOptions();
    }
  }, [currentMode, currentWordIndex, generateQuizOptions]);

  // 熟悉度颜色
  const getFamiliarityColor = (familiarity) => {
    if (familiarity >= 3) return "text-green-500 bg-green-50";
    if (familiarity >= 1) return "text-yellow-500 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  // 渲染学习模式
  const renderLearnMode = () => (
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
            {currentWord.definition}
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

  // 渲染测试模式
  const renderQuizMode = () => (
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

            {/* <div className="bg-gray-50 rounded-2xl p-6 mt-4">
              <p className="text-gray-600 italic">{currentWord.translation}</p>
            </div> */}
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

  // 渲染拼写模式
  const renderSpellingMode = () => (
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
                onClick={() => setShowAnswer(true)}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">AI背单词</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>
                    今日: {studyStats.todayLearned}/{dailyGoal}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="w-4 h-4" />
                  <span>连续: {studyStats.streakDays}天</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>正确率: {studyStats.accuracy}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 模式切换 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex gap-2">
              {[
                { mode: "learn", icon: Book, label: "学习模式" },
                { mode: "quiz", icon: Brain, label: "选择题" },
                { mode: "spelling", icon: Zap, label: "拼写练习" },
              ].map(({ mode, icon: Icon, label }) => (
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

        {/* 进度条 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">学习进度</span>
              <span className="text-sm font-medium text-gray-800">
                {currentWordIndex + 1} / {words.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentWordIndex + 1) / words.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="pb-8">
          {currentMode === "learn" && renderLearnMode()}
          {currentMode === "quiz" && renderQuizMode()}
          {currentMode === "spelling" && renderSpellingMode()}
        </div>
      </div>

      {/* 底部设置面板 */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <div className="flex items-center gap-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(wordBanks).map(([key, bank]) => (
                <option key={key} value={key}>
                  {bank.name} ({bank.count}词)
                </option>
              ))}
            </select>
            <input
              type="number"
              min="10"
              max="100"
              step="5"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value))}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyApp;
