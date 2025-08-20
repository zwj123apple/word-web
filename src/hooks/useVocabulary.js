import { useState, useEffect, useCallback } from "react";

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

import { useDebounce } from "./useDebounce";

export const useVocabulary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState("learn");
  const [selectedBank, setSelectedBank] = useState("cet4");
  const [dailyGoal, setDailyGoal] = useState(30);
  const debouncedDailyGoal = useDebounce(dailyGoal, 500); // 500ms debounce delay
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchWords = useCallback(async (bank, page, limit) => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/word-data?bank=${bank}&page=${page}&limit=${limit}`);
      const data = await response.json();
      if (data.length === 0) {
        setHasMore(false);
      }
      setWords(prevWords => page === 1 ? shuffleArray(data) : shuffleArray([...prevWords, ...data]));
    } catch (error) {
      console.error("Error fetching word data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setWords([]);
    setPage(1);
    setHasMore(true);
    fetchWords(selectedBank, 1, debouncedDailyGoal);
  }, [selectedBank, debouncedDailyGoal, fetchWords]);

  const loadMoreWords = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWords(selectedBank, nextPage, dailyGoal);
  };

  const currentWord = words[currentWordIndex] || words[0];

  useEffect(() => {
    if (currentWordIndex >= words.length - 10 && hasMore && !isLoading) {
      loadMoreWords();
    }
  }, [currentWordIndex, words.length, hasMore, isLoading, loadMoreWords]);

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
    setDailyGoal,
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
    isLoading,
    loadMoreWords,
    hasMore,
  };
};
