export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface DeckMetadata {
  version: string;
  generator: string;
  createdAt: number;
  topic: string;
  totalCards: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  metadata?: DeckMetadata;
  cards: Flashcard[];
  createdAt: number;
}

export interface StudySession {
  deckId: string;
  cardsReviewed: number;
  correctCount: number;
  incorrectCount: number;
  startTime: number;
}
