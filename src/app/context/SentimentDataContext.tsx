import { createContext, ReactNode, useContext, useState } from 'react';
import { mockSentiments } from '../data/mockData';
import type { SentimentInfo, SentimentStatus } from '../types';
import { applyStoredAssociations, associateSentiments } from '../utils/sentimentAssociations';

interface SentimentDataContextValue {
  sentiments: SentimentInfo[];
  addSentiment: (sentiment: SentimentInfo) => void;
  updateSentiment: (sentimentId: string, updates: Partial<SentimentInfo>) => void;
  updateSentimentStatus: (sentimentId: string, status: SentimentStatus) => void;
  associateEvents: (selectedIds: string[], primaryEventId: string) => void;
}

const SentimentDataContext = createContext<SentimentDataContextValue | null>(null);

export function SentimentDataProvider({ children }: { children: ReactNode }) {
  const [sentiments, setSentiments] = useState<SentimentInfo[]>(() => applyStoredAssociations(mockSentiments));

  const addSentiment = (sentiment: SentimentInfo) => {
    setSentiments((prev) => [sentiment, ...prev]);
  };

  const updateSentiment = (sentimentId: string, updates: Partial<SentimentInfo>) => {
    setSentiments((prev) => prev.map((sentiment) => (
      sentiment.id === sentimentId ? { ...sentiment, ...updates } : sentiment
    )));
  };

  const updateSentimentStatus = (sentimentId: string, status: SentimentStatus) => {
    updateSentiment(sentimentId, { status });
  };

  const associateEvents = (selectedIds: string[], primaryEventId: string) => {
    setSentiments((prev) => associateSentiments(prev, selectedIds, primaryEventId));
  };

  return (
    <SentimentDataContext.Provider
      value={{ sentiments, addSentiment, updateSentiment, updateSentimentStatus, associateEvents }}
    >
      {children}
    </SentimentDataContext.Provider>
  );
}

export function useSentimentData() {
  const context = useContext(SentimentDataContext);

  if (!context) {
    throw new Error('useSentimentData must be used within SentimentDataProvider');
  }

  return context;
}
