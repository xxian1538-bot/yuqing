import type { ScoringWeights } from '../types';

export const defaultScoringWeights: ScoringWeights = {
  topicWeight: 10,
  attentionWeight: 15,
  emotionWeight: 15,
  mediaWeight: 20,
  formatWeight: 10,
  channelWeight: 10,
  influenceWeight: 20,
};
