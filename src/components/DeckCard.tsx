import React, { useState, useEffect } from "react";
import { Deck } from "../types";

interface DeckCardProps {
  deck: Deck;
  onStudy: (deckId: string) => void;
  onDelete: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onStudy, onDelete }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Auto-reset confirmation state after 3 seconds
  useEffect(() => {
    if (!isConfirming) return;
    const timer = setTimeout(() => setIsConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [isConfirming]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirming) {
      onDelete(deck.id);
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-card-bg border border-card-border p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/5">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-bg text-accent-fg border border-accent/20">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </span>
            <div className="flex items-center gap-1.5">
              {isConfirming && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md animate-pulse">
                  Click again to delete
                </span>
              )}
              <button
                onClick={handleDelete}
                className={`transition-all duration-300 p-1.5 rounded-lg cursor-pointer ${
                  isConfirming
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 scale-105"
                    : "text-text-muted hover:text-red-400 hover:bg-card-border"
                }`}
                title={isConfirming ? "Confirm deletion" : "Delete deck"}
              >
                {isConfirming ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold text-app-fg mb-2 group-hover:text-accent-fg transition-colors duration-300">
            {deck.name}
          </h3>
          <p className="text-text-muted text-sm line-clamp-3 mb-6">
            {deck.description || "No description provided."}
          </p>
        </div>

        <button
          onClick={() => onStudy(deck.id)}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent hover:bg-accent-hover text-accent-contrast transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 active:scale-[0.98] cursor-pointer"
        >
          Study Now
          <svg className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
