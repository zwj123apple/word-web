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
    todayLearned: 0,
    todayReviewed: 0,
    streakDays: 1, // This is hardcoded for now
    accuracy: 100,
    totalCorrect: 0,
    totalAnswered: 0,
  });
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWords = useCallback(async (bank, page, limit) => {
    setIsLoading(true);
    setError(null);
    try {
      const API_BASE_URL = "/api";
      const response = await fetch(
        `${API_BASE_URL}?bank=${bank}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      const data = Array.isArray(responseData.data) ? responseData.data : [];
      if (data.length === 0) {
        setHasMore(false);
      }
      setWords(shuffleArray(data));
      setCurrentWordIndex(0);
    } catch (error) {
      console.error("Error fetching word data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wordBanks[selectedBank]) {
      const count = wordBanks[selectedBank].count;
      const pages = Math.ceil(count / debouncedDailyGoal);
      setTotalPages(pages);
    }
    setPage(1); // Reset to page 1 when bank or goal changes
  }, [selectedBank, debouncedDailyGoal]);

  useEffect(() => {
    fetchWords(selectedBank, page, debouncedDailyGoal);
  }, [page, selectedBank, debouncedDailyGoal, fetchWords]);

  const currentWord = words[currentWordIndex] || words[0];

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

  const recordAnswer = (isCorrect) => {
    setStudyStats((prev) => {
      const newTotalAnswered = prev.totalAnswered + 1;
      const newTotalCorrect = isCorrect
        ? prev.totalCorrect + 1
        : prev.totalCorrect;
      const newAccuracy =
        newTotalAnswered > 0
          ? Math.round((newTotalCorrect / newTotalAnswered) * 100)
          : 100;

      return {
        ...prev,
        totalAnswered: newTotalAnswered,
        totalCorrect: newTotalCorrect,
        accuracy: newAccuracy,
        todayReviewed: prev.todayReviewed + 1,
      };
    });
  };

  const handleAnswerSubmit = (answer) => {
    setSelectedOption(answer);
    setShowResult(true);

    const isCorrect = answer === currentWord.translation;
    recordAnswer(isCorrect);

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
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    }
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
    page,
    setPage,
    totalPages,
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
    recordAnswer,
    nextWord,
    markFamiliarity,
    wordBanks,
    isLoading,
    hasMore,
  };
};
