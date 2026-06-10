import type { ScoringConfig, ScoringMaxScores, ScoringWeights } from '../types';

export const defaultScoringWeights: ScoringWeights = {
  topicWeight: 10,
  attentionWeight: 15,
  emotionWeight: 15,
  mediaWeight: 20,
  formatWeight: 10,
  channelWeight: 10,
  influenceWeight: 20,
};

export const defaultScoringMaxScores: ScoringMaxScores = {
  topicMaxScore: 100,
  attentionMaxScore: 100,
  emotionMaxScore: 100,
  mediaMaxScore: 100,
  formatMaxScore: 100,
  channelMaxScore: 100,
  influenceMaxScore: 100,
};

export const defaultScoringConfig: ScoringConfig = {
  weights: defaultScoringWeights,
  maxScores: defaultScoringMaxScores,
};

export function normalizeScoringConfig(config: Partial<ScoringConfig> | ScoringWeights | undefined): ScoringConfig {
  if (!config) {
    return defaultScoringConfig;
  }

  if ('weights' in config || 'maxScores' in config) {
    return {
      weights: {
        ...defaultScoringWeights,
        ...(config as Partial<ScoringConfig>).weights,
      },
      maxScores: {
        ...defaultScoringMaxScores,
        ...(config as Partial<ScoringConfig>).maxScores,
      },
    };
  }

  return {
    weights: {
      ...defaultScoringWeights,
      ...(config as ScoringWeights),
    },
    maxScores: defaultScoringMaxScores,
  };
}
