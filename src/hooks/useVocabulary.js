import { useState, useEffect, useCallback } from "react";
import cet4Data from "../data/cet4.json";
import cet6Data from "../data/cet6.json";
import gaokaoData from "../data/gaokao.json";

const wordBanks = {
  cet4: { name: "CET-4", count: 3849 },
  cet6: { name: "CET-6", count: 5407 },
  gaokao: { name: "gaokao", count: 3677 },
};

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const wordDatabase = {
  cet4: shuffleArray(cet4Data),
  cet6: shuffleArray(cet6Data),
  gaokao: shuffleArray(gaokaoData),
};

export const useVocabulary = () => {
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

  useEffect(() => {
    const newWords = wordDatabase[selectedBank] || wordDatabase.cet4;
    setWords(newWords);
    setCurrentWordIndex(0);
  }, [selectedBank]);

  const speakWord = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

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

  const handleAnswerSubmit = (answer) => {
    setSelectedOption(answer);
    setShowResult(true);

    const isCorrect = answer === currentWord.definition;

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

    setStudyStats((prev) => ({
      ...prev,
      todayLearned:
        currentMode === "learn" ? prev.todayLearned + 1 : prev.todayLearned,
      todayReviewed:
        currentMode === "quiz" ? prev.todayReviewed + 1 : prev.todayReviewed,
      accuracy: Math.round(prev.accuracy * 0.9 + (isCorrect ? 10 : 0)),
    }));
  };

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % words.length);
    setShowAnswer(false);
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswer("");
  };

  const markFamiliarity = (level) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === currentWord.id ? { ...w, familiarity: level } : w
      )
    );
    nextWord();
  };

  useEffect(() => {
    if (currentMode === "quiz" && words.length > 0) {
      generateQuizOptions();
    }
  }, [currentMode, currentWordIndex, generateQuizOptions]);

  useEffect(() => {
    if (currentWord) {
      speakWord(currentWord.word);
    }
  }, [currentMode, currentWord, speakWord]);

  return {
    currentMode,
    setCurrentMode,
    selectedBank,
    setSelectedBank,
    dailyGoal,
    setDailyGoal,
    currentWordIndex,
    words,
    userAnswer,
    setUserAnswer,
    showAnswer,
    setShowAnswer,
    studyStats,
    quizOptions,
    selectedOption,
    showResult,
    currentWord,
    speakWord,
    handleAnswerSubmit,
    nextWord,
    markFamiliarity,
    wordBanks,
  };
};
