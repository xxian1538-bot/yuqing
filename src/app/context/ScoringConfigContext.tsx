import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { defaultScoringConfig, normalizeScoringConfig } from '../data/scoringConfig';
import { appApi } from '../lib/api';
import type { ScoringConfig, ScoringMaxScores, ScoringWeights } from '../types';

interface ScoringConfigContextValue {
  weights: ScoringWeights;
  maxScores: ScoringMaxScores;
  updateConfig: (config: ScoringConfig) => void;
}

const ScoringConfigContext = createContext<ScoringConfigContextValue | null>(null);

export function ScoringConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ScoringConfig>(defaultScoringConfig);

  useEffect(() => {
    void (async () => {
      try {
        const nextConfig = await appApi.getScoringConfig();
        setConfig(normalizeScoringConfig(nextConfig));
      } catch (error) {
        console.error('Failed to load scoring config', error);
      }
    })();
  }, []);

  const updateConfig = (nextConfig: ScoringConfig) => {
    void (async () => {
      try {
        const normalizedConfig = normalizeScoringConfig(nextConfig);
        await appApi.updateScoringConfig(normalizedConfig);
        setConfig(normalizedConfig);
      } catch (error) {
        console.error('Failed to update scoring config', error);
      }
    })();
  };

  return (
    <ScoringConfigContext.Provider value={{ weights: config.weights, maxScores: config.maxScores, updateConfig }}>
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
