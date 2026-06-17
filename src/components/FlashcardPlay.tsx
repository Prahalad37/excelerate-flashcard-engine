import React, { useState, useEffect } from "react";
import { Deck, Flashcard, StudySession } from "../types";

interface FlashcardPlayProps {
  deck: Deck;
  onClose: () => void;
  onSessionComplete: (session: StudySession) => void;
}

export const FlashcardPlay: React.FC<FlashcardPlayProps> = ({
  deck,
  onClose,
  onSessionComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [session, setSession] = useState<StudySession>({
    deckId: deck.id,
    cardsReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
    startTime: Date.now(),
  });
  const [isFinished, setIsFinished] = useState(false);

  const currentCard: Flashcard = deck.cards[currentIndex];
  const progressPercent = deck.cards.length > 0 ? (currentIndex / deck.cards.length) * 100 : 0;

  // Key press listener for accessibility & fast workflows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (isFlipped) handleScore(false);
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (isFlipped) handleScore(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, isFinished]);

  const handleScore = (isCorrect: boolean) => {
    setIsFlipped(false);

    // Wait for card flip animation to finish before updating index
    setTimeout(() => {
      setSession((prev) => ({
        ...prev,
        cardsReviewed: prev.cardsReviewed + 1,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
      }));

      if (currentIndex + 1 >= deck.cards.length) {
        setIsFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 200);
  };

  const handleFinish = () => {
    onSessionComplete({
      ...session,
    });
    onClose();
  };

  if (isFinished) {
    const elapsedMinutes = Math.max(
      1,
      Math.round((Date.now() - session.startTime) / 1000 / 60)
    );
    const scorePercent = Math.round(
      (session.correctCount / deck.cards.length) * 100
    );

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] max-w-lg mx-auto bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-zinc-100 mb-2">Session Complete!</h2>
        <p className="text-zinc-400 text-sm text-center mb-8">
          You have reviewed all cards in <span className="font-semibold text-emerald-400">{deck.name}</span>.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-zinc-100">{scorePercent}%</div>
            <div className="text-xs text-zinc-400 mt-1">Accuracy Score</div>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-zinc-100">{session.correctCount} / {deck.cards.length}</div>
            <div className="text-xs text-zinc-400 mt-1">Correct Answers</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setIsFinished(false);
              setSession({
                deckId: deck.id,
                cardsReviewed: 0,
                correctCount: 0,
                incorrectCount: 0,
                startTime: Date.now(),
              });
            }}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all duration-200"
          >
            Study Again
          </button>
          <button
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header & Progress */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onClose}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quit Session
        </button>
        <span className="text-sm font-semibold text-zinc-400">
          Card {currentIndex + 1} of {deck.cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-96 perspective-1000 cursor-pointer group mb-8"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-zinc-900 border-2 border-zinc-800/80 hover:border-zinc-700/80 p-8 rounded-3xl flex flex-col justify-between shadow-2xl transition-all duration-300">
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Question</span>
            <div className="flex-grow flex items-center justify-center text-center">
              <p className="text-xl md:text-2xl font-semibold leading-relaxed text-zinc-100 select-none">
                {currentCard?.front}
              </p>
            </div>
            <span className="text-xs text-center text-zinc-500 group-hover:text-zinc-400 transition-colors">
              Click Card or Press Space to Flip
            </span>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-zinc-900 border-2 border-zinc-800/80 p-8 rounded-3xl flex flex-col justify-between shadow-2xl">
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">Answer</span>
            <div className="flex-grow flex items-center justify-center text-center">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-200 select-none whitespace-pre-line">
                {currentCard?.back}
              </p>
            </div>
            <span className="text-xs text-center text-zinc-500">
              Click Card or Press Space to Flip back
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 min-h-14">
        {isFlipped ? (
          <div className="flex gap-4 w-full max-w-md animate-fade-in">
            <button
              onClick={() => handleScore(false)}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all duration-200"
            >
              Incorrect (A)
            </button>
            <button
              onClick={() => handleScore(true)}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all duration-200"
            >
              Correct (D)
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full max-w-xs inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 active:scale-95 transition-all duration-200"
          >
            Reveal Answer
          </button>
        )}
      </div>
    </div>
  );
};
