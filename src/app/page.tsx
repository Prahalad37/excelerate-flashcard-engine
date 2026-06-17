"use client";

import { useState, useEffect } from "react";
import { Deck, StudySession } from "../types";
import { DeckCard } from "../components/DeckCard";
import { FlashcardPlay } from "../components/FlashcardPlay";
import { DeckCreator } from "../components/DeckCreator";

const DEMO_DECKS: Deck[] = [
  {
    id: "demo_nextjs",
    name: "Next.js 16 Essentials",
    description: "Learn core React Server Components, App Router rules, and routing directives in Next.js.",
    createdAt: Date.now() - 86400000 * 2,
    cards: [
      {
        id: "demo_nextjs_1",
        front: "What is the difference between Server Components and Client Components in Next.js?",
        back: "Server Components render on the server by default for faster page loads and smaller bundle sizes. Client Components are marked with 'use client' and allow interactivity, state, and browser APIs.",
      },
      {
        id: "demo_nextjs_2",
        front: "How do you define a dynamic route segment in Next.js?",
        back: "By wrapping a folder name in square brackets, e.g. src/app/blog/[id]/page.tsx. The param 'id' is then passed to the page component via the params prop.",
      },
      {
        id: "demo_nextjs_3",
        front: "What is the purpose of layout.tsx?",
        back: "It defines shared UI across multiple pages (e.g. headers, footers, sidebars). It preserves state and does not re-render when navigating between sibling routes.",
      },
      {
        id: "demo_nextjs_4",
        front: "How can you securely retrieve environment variables on the client-side?",
        back: "By prefixing the environment variable name with NEXT_PUBLIC_, e.g. NEXT_PUBLIC_ANALYTICS_ID. Variables without this prefix are only accessible in server environments.",
      },
      {
        id: "demo_nextjs_5",
        front: "What does the Next.js Link component do?",
        back: "It extends the HTML <a> tag to provide prefetching and client-side navigation between routes, enabling instant transitions without full page refreshes.",
      },
    ],
  },
  {
    id: "demo_websec",
    name: "Web Security Core",
    description: "Understand common web vulnerabilities like XSS, CSRF, and how to defend against them.",
    createdAt: Date.now() - 86400000,
    cards: [
      {
        id: "demo_websec_1",
        front: "What is Cross-Site Scripting (XSS)?",
        back: "A vulnerability where an attacker injects malicious client-side scripts into web pages viewed by other users. Defended by escaping inputs, sanitizing HTML, and setting a robust CSP.",
      },
      {
        id: "demo_websec_2",
        front: "What is Cross-Site Request Forgery (CSRF)?",
        back: "An attack that forces an authenticated user to execute unwanted actions on a web application they're logged into. Defended using anti-CSRF tokens and SameSite cookie attributes.",
      },
      {
        id: "demo_websec_3",
        front: "What does a Content Security Policy (CSP) accomplish?",
        back: "It is an HTTP response header that restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page, preventing XSS and injection attacks.",
      },
    ],
  },
];

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [sessionsPlayed, setSessionsPlayed] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  // Initialize and load from LocalStorage
  useEffect(() => {
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

    const storedStats = localStorage.getItem("excelerate_stats");
    if (storedStats) {
      try {
        const stats = JSON.parse(storedStats);
        setSessionsPlayed(stats.sessionsPlayed || 0);
        setOverallAccuracy(stats.overallAccuracy || 0);
      } catch (e) {}
    }
  }, []);

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
    if (confirm("Are you sure you want to delete this deck?")) {
      const updated = decks.filter((d) => d.id !== deckId);
      saveDecks(updated);
    }
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

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-zinc-950 text-xl shadow-lg shadow-emerald-500/20">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Excelerate<span className="text-emerald-400">.</span>
            </span>
          </div>
          <a
            href="https://github.com/Prahalad37/excelerate-flashcard-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
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
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
                  AI-Powered Learning
                </h1>
                <p className="mt-3 text-lg text-zinc-400 max-w-2xl">
                  Create decks manually or generate high-quality, conceptual flashcards in seconds using the <span className="text-emerald-400 font-semibold">DeepSeek AI Engine</span>.
                </p>
              </div>
              <button
                onClick={() => setShowCreator(true)}
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all duration-350 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-95 whitespace-nowrap self-start md:self-auto"
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create New Deck
              </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                <div className="text-sm font-medium text-zinc-500">Total Decks</div>
                <div className="text-3xl font-extrabold text-zinc-200 mt-1">{decks.length}</div>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                <div className="text-sm font-medium text-zinc-500">Total Cards</div>
                <div className="text-3xl font-extrabold text-zinc-200 mt-1">{totalCards}</div>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                <div className="text-sm font-medium text-zinc-500">Sessions Completed</div>
                <div className="text-3xl font-extrabold text-zinc-200 mt-1">{sessionsPlayed}</div>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                <div className="text-sm font-medium text-zinc-500">Overall Accuracy</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {sessionsPlayed > 0 ? `${overallAccuracy}%` : "--"}
                </div>
              </div>
            </div>

            {/* Deck List Section */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-200 mb-6">Your Flashcard Decks</h2>
              {decks.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-300">No decks found</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Get started by generating your first deck with AI or creating one manually.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreator(true)}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-md shadow-emerald-500/10"
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
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Excelerate Flashcard Engine. Built using Next.js & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
