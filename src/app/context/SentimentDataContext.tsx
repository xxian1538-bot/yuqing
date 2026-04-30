import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { appApi, type ReportPayload } from '../lib/api';
import type { SentimentInfo, SentimentStatus } from '../types';

interface SentimentDataContextValue {
  sentiments: SentimentInfo[];
  addSentiment: (sentiment: SentimentInfo) => void;
  updateSentiment: (sentimentId: string, updates: Partial<SentimentInfo>) => void;
  updateSentimentStatus: (sentimentId: string, status: SentimentStatus) => void;
  associateEvents: (selectedIds: string[], primaryEventId: string) => void;
  reportSentiments: (payload: ReportPayload) => void;
  refreshSentiments: () => void;
}

const SentimentDataContext = createContext<SentimentDataContextValue | null>(null);

export function SentimentDataProvider({ children }: { children: ReactNode }) {
  const [sentiments, setSentiments] = useState<SentimentInfo[]>([]);

  const loadSentiments = async () => {
    try {
      const nextSentiments = await appApi.getSentiments();
      setSentiments(nextSentiments);
    } catch (error) {
      console.error('Failed to load sentiments', error);
    }
  };

  useEffect(() => {
    void loadSentiments();
  }, []);

  const addSentiment = (sentiment: SentimentInfo) => {
    void (async () => {
      try {
        await appApi.addSentiment(sentiment);
        await loadSentiments();
      } catch (error) {
        console.error('Failed to add sentiment', error);
      }
    })();
  };

  const updateSentiment = (sentimentId: string, updates: Partial<SentimentInfo>) => {
    void (async () => {
      try {
        await appApi.updateSentiment(sentimentId, updates);
        await loadSentiments();
      } catch (error) {
        console.error('Failed to update sentiment', error);
      }
    })();
  };

  const updateSentimentStatus = (sentimentId: string, status: SentimentStatus) => {
    void (async () => {
      try {
        await appApi.updateSentimentStatus(sentimentId, status);
        await loadSentiments();
      } catch (error) {
        console.error('Failed to update sentiment status', error);
      }
    })();
  };

  const associateEvents = (selectedIds: string[], primaryEventId: string) => {
    void (async () => {
      try {
        await appApi.associateEvents(selectedIds, primaryEventId);
        await loadSentiments();
      } catch (error) {
        console.error('Failed to associate events', error);
      }
    })();
  };

  const reportSentiments = (payload: ReportPayload) => {
    void (async () => {
      try {
        await appApi.reportSentiments(payload);
        await loadSentiments();
      } catch (error) {
        console.error('Failed to report sentiments', error);
      }
    })();
  };

  return (
    <SentimentDataContext.Provider
      value={{
        sentiments,
        addSentiment,
        updateSentiment,
        updateSentimentStatus,
        associateEvents,
        reportSentiments,
        refreshSentiments: () => {
          void loadSentiments();
        },
      }}
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
