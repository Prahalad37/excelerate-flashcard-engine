import React, { useState } from "react";
import { Deck, Flashcard } from "../types";

interface DeckCreatorProps {
  onAddDeck: (deck: Deck) => void;
  onCancel: () => void;
}

export const DeckCreator: React.FC<DeckCreatorProps> = ({ onAddDeck, onCancel }) => {
  const [creationMode, setCreationMode] = useState<"ai" | "manual">("ai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Form States
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [quantity, setQuantity] = useState(5);

  // Manual Form States
  const [deckName, setDeckName] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [manualCards, setManualCards] = useState<{ front: string; back: string }[]>([
    { front: "", back: "" },
  ]);

  const handleAddManualCardRow = () => {
    setManualCards([...manualCards, { front: "", back: "" }]);
  };

  const handleRemoveManualCardRow = (index: number) => {
    if (manualCards.length > 1) {
      setManualCards(manualCards.filter((_, i) => i !== index));
    }
  };

  const handleManualCardChange = (index: number, field: "front" | "back", value: string) => {
    const updated = [...manualCards];
    updated[index][field] = value;
    setManualCards(updated);
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !sourceText.trim()) {
      setError("Please enter either a topic/prompt or paste some text.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          sourceText,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate deck");
      }

      const generatedCards: Flashcard[] = data.cards.map((card: any, idx: number) => ({
        id: `card_${Date.now()}_${idx}`,
        front: card.front,
        back: card.back,
      }));

      const newDeck: Deck = {
        id: `deck_${Date.now()}`,
        name: data.name || topic || "AI Generated Deck",
        description: data.description || `Flashcards generated about ${topic || "custom text"}.`,
        metadata: data.metadata,
        cards: generatedCards,
        createdAt: Date.now(),
      };

      onAddDeck(newDeck);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) {
      setError("Please enter a deck name.");
      return;
    }

    const validCards = manualCards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError("Please add at least one complete card (both Question and Answer).");
      return;
    }

    const cardsWithIds: Flashcard[] = validCards.map((c, idx) => ({
      id: `card_${Date.now()}_${idx}`,
      front: c.front.trim(),
      back: c.back.trim(),
    }));

    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name: deckName.trim(),
      description: deckDesc.trim(),
      cards: cardsWithIds,
      createdAt: Date.now(),
    };

    onAddDeck(newDeck);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card-bg border border-card-border p-6 md:p-8 rounded-3xl backdrop-blur-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-app-fg">Create New Deck</h2>
        <button
          onClick={onCancel}
          className="text-text-muted hover:text-app-fg text-sm font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-app-bg p-1 rounded-xl mb-8 border border-card-border/80">
        <button
          onClick={() => {
            setCreationMode("ai");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
            creationMode === "ai"
              ? "bg-accent text-accent-contrast shadow-md shadow-accent/10"
              : "text-text-muted hover:text-app-fg"
          }`}
        >
          ⚡ AI Generator (DeepSeek)
        </button>
        <button
          onClick={() => {
            setCreationMode("manual");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
            creationMode === "manual"
              ? "bg-accent text-accent-contrast shadow-md shadow-accent/10"
              : "text-text-muted hover:text-app-fg"
          }`}
        >
          ✍️ Manual Creator
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* AI Mode Form */}
      {creationMode === "ai" && (
        <form onSubmit={handleGenerateAI} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-muted mb-2">
              Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Spaced Repetition, Photosynthesis, French Verbs"
              className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-3 text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-muted mb-2">
              Study Material / Notes
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your study notes, articles, or text book chapters here..."
              rows={6}
              className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-3 text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-text-muted">
                Number of Cards
              </label>
              <span className="text-sm font-bold text-accent-fg bg-accent-bg border border-accent/20 px-2 py-0.5 rounded-lg">
                {quantity}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-accent bg-card-border h-1.5 rounded-lg appearance-none cursor-pointer"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold bg-accent hover:bg-accent-hover text-accent-contrast transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/10 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-accent-contrast" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Making Flashcards...
              </span>
            ) : (
              "Make Flashcards"
            )}
          </button>
        </form>
      )}

      {/* Manual Mode Form */}
      {creationMode === "manual" && (
        <form onSubmit={handleSaveManual} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-muted mb-2">
              Deck Name
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g. Javascript Fundamentals"
              className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-3 text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-muted mb-2">
              Deck Description
            </label>
            <input
              type="text"
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              placeholder="e.g. Core concepts of ES6, async/await, and scope."
              className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-3 text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-text-muted">
              Cards
            </label>

            {manualCards.map((card, idx) => (
              <div 
                key={idx} 
                className="relative bg-card-bg/40 p-4 border border-card-border rounded-2xl flex flex-col gap-3 group/row"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-muted">Card #{idx + 1}</span>
                  {manualCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveManualCardRow(idx)}
                      className="text-text-muted hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-card-border cursor-pointer text-xs font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => handleManualCardChange(idx, "front", e.target.value)}
                    placeholder="Question (Front)"
                    className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-2.5 text-sm text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <input
                    type="text"
                    value={card.back}
                    onChange={(e) => handleManualCardChange(idx, "back", e.target.value)}
                    placeholder="Answer (Back)"
                    className="w-full bg-app-bg border border-card-border rounded-xl px-4 py-2.5 text-sm text-app-fg placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddManualCardRow}
              className="w-full border border-dashed border-card-border hover:border-accent/40 text-text-muted hover:text-app-fg py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            >
              + Add Another Card
            </button>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold bg-accent hover:bg-accent-hover text-accent-contrast transition-all duration-200 shadow-lg shadow-accent/10 cursor-pointer"
          >
            Save Deck
          </button>
        </form>
      )}
    </div>
  );
};
