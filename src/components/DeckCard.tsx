import React from "react";
import { Deck } from "../types";

interface DeckCardProps {
  deck: Deck;
  onStudy: (deckId: string) => void;
  onDelete: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onStudy, onDelete }) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700/80 hover:shadow-2xl hover:shadow-emerald-500/5">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </span>
            <button
              onClick={() => onDelete(deck.id)}
              className="text-zinc-500 hover:text-red-400 transition-colors duration-250 p-1 rounded-lg hover:bg-zinc-800/50"
              title="Delete deck"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors duration-300">
            {deck.name}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-3 mb-6">
            {deck.description || "No description provided."}
          </p>
        </div>

        <button
          onClick={() => onStudy(deck.id)}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all duration-300 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-[0.98]"
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
