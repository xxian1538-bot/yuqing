import { createContext, ReactNode, useContext, useState } from 'react';
import type { ScoringWeights } from '../types';

const defaultWeights: ScoringWeights = {
  topicWeight: 10,
  attentionWeight: 15,
  emotionWeight: 15,
  mediaWeight: 20,
  formatWeight: 10,
  channelWeight: 10,
  influenceWeight: 20,
};

interface ScoringConfigContextValue {
  weights: ScoringWeights;
  updateWeights: (weights: ScoringWeights) => void;
}

const ScoringConfigContext = createContext<ScoringConfigContextValue | null>(null);

export function ScoringConfigProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<ScoringWeights>(defaultWeights);

  return (
    <ScoringConfigContext.Provider value={{ weights, updateWeights: setWeights }}>
      {children}
    </ScoringConfigContext.Provider>
  );
}

export function useScoringConfig() {
  const context = useContext(ScoringConfigContext);

  if (!context) {
    throw new Error('useScoringConfig must be used within ScoringConfigProvider');
  }

  return context;
}
