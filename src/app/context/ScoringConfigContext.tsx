import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { defaultScoringWeights } from '../data/scoringConfig';
import { appApi } from '../lib/api';
import type { ScoringWeights } from '../types';

interface ScoringConfigContextValue {
  weights: ScoringWeights;
  updateWeights: (weights: ScoringWeights) => void;
}

const ScoringConfigContext = createContext<ScoringConfigContextValue | null>(null);

export function ScoringConfigProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);

  useEffect(() => {
    void (async () => {
      try {
        const nextWeights = await appApi.getScoringWeights();
        setWeights(nextWeights);
      } catch (error) {
        console.error('Failed to load scoring weights', error);
      }
    })();
  }, []);

  const updateWeights = (nextWeights: ScoringWeights) => {
    void (async () => {
      try {
        await appApi.updateScoringWeights(nextWeights);
        setWeights(nextWeights);
      } catch (error) {
        console.error('Failed to update scoring weights', error);
      }
    })();
  };

  return (
    <ScoringConfigContext.Provider value={{ weights, updateWeights }}>
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
