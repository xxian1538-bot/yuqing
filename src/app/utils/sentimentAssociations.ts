import type { SentimentInfo } from '../types';

export function applyStoredAssociations(sentiments: SentimentInfo[]): SentimentInfo[] {
  return sentiments;
}

export function getAssociationGroupIds(sentiments: SentimentInfo[], ids: string[]): string[] {
  const groupIds = new Set(ids);

  ids.forEach((id) => {
    const sentiment = sentiments.find((item) => item.id === id);
    if (!sentiment) {
      return;
    }

    groupIds.add(sentiment.primaryEventId || sentiment.id);
    sentiment.relatedEventIds?.forEach((relatedId) => groupIds.add(relatedId));
  });

  return Array.from(groupIds);
}

export function associateSentiments(
  sentiments: SentimentInfo[],
  selectedIds: string[],
  primaryEventId: string,
): SentimentInfo[] {
  const groupIds = getAssociationGroupIds(sentiments, selectedIds);

  const updatedSentiments = sentiments.map((sentiment) => {
    if (!groupIds.includes(sentiment.id)) {
      return sentiment;
    }

    return {
      ...sentiment,
      primaryEventId,
      relatedEventIds: groupIds.filter((id) => id !== sentiment.id),
    };
  });

  return updatedSentiments;
}
