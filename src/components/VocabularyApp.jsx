import React from "react";
import { useVocabulary } from "../hooks/useVocabulary";
import Header from "./Header";
import ModeSwitcher from "./ModeSwitcher";
import ProgressBar from "./ProgressBar";
import LearnMode from "./LearnMode";
import QuizMode from "./QuizMode";
import SpellingMode from "./SpellingMode";
import SettingsPanel from "./SettingsPanel";
import Pagination from "./Pagination";

const VocabularyApp = () => {
  const {
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
    nextWord,
    markFamiliarity,
    wordBanks,
    isLoading,
    hasMore,
    error,
  } = useVocabulary();

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
          color: "#d32f2f",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <p>Error loading vocabulary data:</p>
        <p>{error.message}</p>
        <p>Please try again later or check your network connection.</p>
      </div>
    );
  }

  if (isLoading && words.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header
        studyStats={studyStats}
        dailyGoal={dailyGoal}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
      />

      <ProgressBar
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
      />

      <div className="pb-6">
        {currentMode === "learn" && (
          <LearnMode
            currentWord={currentWord}
            speakWord={speakWord}
            markFamiliarity={markFamiliarity}
          />
        )}
        {currentMode === "quiz" && (
          <QuizMode
            currentWord={currentWord}
            quizOptions={quizOptions}
            showResult={showResult}
            selectedOption={selectedOption}
            handleAnswerSubmit={handleAnswerSubmit}
            nextWord={nextWord}
            speakWord={speakWord}
          />
        )}
        {currentMode === "spelling" && (
          <SpellingMode
            currentWord={currentWord}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            nextWord={nextWord}
            speakWord={speakWord}
          />
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <SettingsPanel
        wordBanks={wordBanks}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        dailyGoal={dailyGoal}
        setDailyGoal={setDailyGoal}
      />
    </div>
  );
};

export default VocabularyApp;
