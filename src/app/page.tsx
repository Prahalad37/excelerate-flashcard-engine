"use client";

import { useState, useEffect } from "react";
import { Deck, StudySession } from "../types";
import { DeckCard } from "../components/DeckCard";
import { FlashcardPlay } from "../components/FlashcardPlay";
import { DeckCreator } from "../components/DeckCreator";

const DEMO_DECKS: Deck[] = [
  {
    id: "demo_ai",
    name: "Artificial Intelligence Core",
    description: "Explore the foundation of modern AI, machine learning paradigms, and neural networks.",
    createdAt: Date.now() - 86400000 * 2,
    cards: [
      {
        id: "demo_ai_1",
        front: "What is the difference between Supervised and Unsupervised Learning?",
        back: "Supervised learning trains models on labeled input-output data pairs to predict outcomes. Unsupervised learning analyzes unlabeled data to uncover hidden patterns, structures, and clusters.",
      },
      {
        id: "demo_ai_2",
        front: "What is a Neural Network in Artificial Intelligence?",
        back: "A machine learning model inspired by the human brain's structure, consisting of interconnected node layers (input, hidden, and output) that process data and extract complex features.",
      },
      {
        id: "demo_ai_3",
        front: "What is the Turing Test?",
        back: "A test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human, introduced by Alan Turing in 1950.",
      },
      {
        id: "demo_ai_4",
        front: "What is Overfitting in machine learning models?",
        back: "A scenario where a model performs extremely well on training data but fails to generalize to new, unseen testing data. Resolved by regularization, dropouts, or adding more training samples.",
      },
    ],
  },
  {
    id: "demo_robotics",
    name: "Robotics Engineering Basics",
    description: "Learn the fundamentals of robot design, sensors, actuators, and motion kinematics.",
    createdAt: Date.now() - 86400000,
    cards: [
      {
        id: "demo_robotics_1",
        front: "What is Robot Kinematics?",
        back: "The study of the motion of robots (manipulators, links, joints) without considering the forces that cause the motion. It includes forward kinematics (joint to position) and inverse kinematics.",
      },
      {
        id: "demo_robotics_2",
        front: "What is the purpose of an Actuator in a robot?",
        back: "A mechanical component that converts energy (electrical, hydraulic, or pneumatic) into physical movement, allowing a robot to interact with and manipulate its environment.",
      },
      {
        id: "demo_robotics_3",
        front: "How does a LiDAR sensor work on autonomous mobile robots?",
        back: "LiDAR (Light Detection and Ranging) emits rapid laser pulses and measures the time they take to bounce back off surrounding objects, constructing high-resolution 3D point cloud maps of the environment.",
      },
      {
        id: "demo_robotics_4",
        front: "What are Isaac Asimov's Three Laws of Robotics?",
        back: "1. A robot may not injure a human being. 2. A robot must obey human orders unless they conflict with the First Law. 3. A robot must protect its own existence unless it conflicts with the First or Second Law.",
      },
    ],
  },
];

type Theme = "dark" | "bright" | "ultra-bright";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [sessionsPlayed, setSessionsPlayed] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [theme, setTheme] = useState<Theme>("dark");

  // Load from LocalStorage on mount
  useEffect(() => {
    // 1. Theme loading
    const storedTheme = localStorage.getItem("excelerate_theme") as Theme;
    if (storedTheme && ["dark", "bright", "ultra-bright"].includes(storedTheme)) {
      setTheme(storedTheme);
    }

    // 2. Decks loading
    const storedDecks = localStorage.getItem("excelerate_decks");
    if (storedDecks) {
      try {
        setDecks(JSON.parse(storedDecks));
      } catch (e) {
        setDecks(DEMO_DECKS);
      }
    } else {
      setDecks(DEMO_DECKS);
      localStorage.setItem("excelerate_decks", JSON.stringify(DEMO_DECKS));
    }

    // 3. Stats loading
    const storedStats = localStorage.getItem("excelerate_stats");
    if (storedStats) {
      try {
        const stats = JSON.parse(storedStats);
        setSessionsPlayed(stats.sessionsPlayed || 0);
        setOverallAccuracy(stats.overallAccuracy || 0);
      } catch (e) {}
    }
  }, []);

  // Apply theme class to document element (html/root) to enable CSS variable cascading
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("theme-bright", "theme-ultra-bright");
    if (theme === "bright") {
      root.classList.add("theme-bright");
    } else if (theme === "ultra-bright") {
      root.classList.add("theme-ultra-bright");
    }
  }, [theme]);

  const saveDecks = (updatedDecks: Deck[]) => {
    setDecks(updatedDecks);
    localStorage.setItem("excelerate_decks", JSON.stringify(updatedDecks));
  };

  const handleAddDeck = (newDeck: Deck) => {
    const updated = [newDeck, ...decks];
    saveDecks(updated);
    setShowCreator(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    const updated = decks.filter((d) => d.id !== deckId);
    saveDecks(updated);
  };

  const handleSessionComplete = (session: StudySession) => {
    const accuracy = session.cardsReviewed > 0 
      ? (session.correctCount / session.cardsReviewed) * 100 
      : 0;

    const newSessionsCount = sessionsPlayed + 1;
    const newAccuracy = Math.round(
      (overallAccuracy * sessionsPlayed + accuracy) / newSessionsCount
    );

    setSessionsPlayed(newSessionsCount);
    setOverallAccuracy(newAccuracy);

    localStorage.setItem(
      "excelerate_stats",
      JSON.stringify({
        sessionsPlayed: newSessionsCount,
        overallAccuracy: newAccuracy,
      })
    );
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("excelerate_theme", newTheme);
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="min-h-screen bg-app-bg text-app-fg flex flex-col font-sans selection:bg-accent/30 selection:text-accent-fg transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border-divider bg-app-bg/75 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center font-black text-accent-contrast text-xl shadow-lg shadow-accent/20 transition-all duration-300">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-app-fg">
              Excelerate<span className="text-accent-fg">.</span>
            </span>
          </div>

          {/* Theme switcher & Github link */}
          <div className="flex items-center gap-6">
            {/* Theme switcher segmented control */}
            <div className="flex items-center bg-card-bg border border-card-border p-1 rounded-xl gap-0.5">
              <button
                onClick={() => handleThemeChange("dark")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  theme === "dark"
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "text-text-muted hover:text-app-fg"
                }`}
                title="Dark Theme"
              >
                🌙 <span className="hidden sm:inline">Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange("bright")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  theme === "bright"
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "text-text-muted hover:text-app-fg"
                }`}
                title="Bright Theme"
              >
                ☀️ <span className="hidden sm:inline">Bright</span>
              </button>
              <button
                onClick={() => handleThemeChange("ultra-bright")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  theme === "ultra-bright"
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "text-text-muted hover:text-app-fg"
                }`}
                title="More Bright Theme"
              >
                ⚡ <span className="hidden sm:inline">Ultra</span>
              </button>
            </div>

            <a
              href="https://github.com/Prahalad37/excelerate-flashcard-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-app-fg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeDeck ? (
          /* Study Session Interface */
          <FlashcardPlay
            deck={activeDeck}
            onClose={() => setActiveDeckId(null)}
            onSessionComplete={handleSessionComplete}
          />
        ) : showCreator ? (
          /* Create / Generate Deck Interface */
          <DeckCreator
            onAddDeck={handleAddDeck}
            onCancel={() => setShowCreator(false)}
          />
        ) : (
          /* Main Dashboard */
          <div className="space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-divider pb-8 transition-colors duration-300">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-app-fg sm:text-5xl">
                  AI-Powered Learning
                </h1>
                <p className="mt-3 text-lg text-text-muted max-w-2xl">
                  Create decks manually or generate high-quality, conceptual flashcards in seconds using the <span className="text-accent-fg font-bold">DeepSeek AI Engine</span>.
                </p>
              </div>
              <button
                onClick={() => setShowCreator(true)}
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-bold bg-accent hover:bg-accent-hover text-accent-contrast transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 active:scale-95 whitespace-nowrap self-start md:self-auto cursor-pointer"
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create New Deck
              </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card-bg border border-card-border p-5 rounded-2xl transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Decks</div>
                <div className="text-3xl font-black text-app-fg mt-1">{decks.length}</div>
              </div>
              <div className="bg-card-bg border border-card-border p-5 rounded-2xl transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Cards</div>
                <div className="text-3xl font-black text-app-fg mt-1">{totalCards}</div>
              </div>
              <div className="bg-card-bg border border-card-border p-5 rounded-2xl transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sessions Completed</div>
                <div className="text-3xl font-black text-app-fg mt-1">{sessionsPlayed}</div>
              </div>
              <div className="bg-card-bg border border-card-border p-5 rounded-2xl transition-all duration-300">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Accuracy</div>
                <div className="text-3xl font-black text-accent-fg mt-1">
                  {sessionsPlayed > 0 ? `${overallAccuracy}%` : "--"}
                </div>
              </div>
            </div>

            {/* Deck List Section */}
            <div>
              <h2 className="text-2xl font-bold text-app-fg mb-6">Your Flashcard Decks</h2>
              {decks.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-card-border rounded-3xl">
                  <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <h3 className="mt-4 text-sm font-semibold text-app-fg">No decks found</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Get started by generating your first deck with AI or creating one manually.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreator(true)}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-accent hover:bg-accent-hover text-accent-contrast transition-colors shadow-md shadow-accent/10 cursor-pointer"
                    >
                      Create Deck
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {decks.map((deck) => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      onStudy={(id) => setActiveDeckId(id)}
                      onDelete={handleDeleteDeck}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-divider bg-app-bg transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Excelerate Flashcard Engine. Built using Next.js & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
