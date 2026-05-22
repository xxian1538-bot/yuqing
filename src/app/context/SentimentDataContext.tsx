import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { appApi, type ReportPayload } from '../lib/api';
import type { SentimentInfo, SentimentStatus } from '../types';

interface SentimentDataContextValue {
  sentiments: SentimentInfo[];
  loading: boolean;
  addSentiment: (sentiment: SentimentInfo) => Promise<void>;
  updateSentiment: (sentimentId: string, updates: Partial<SentimentInfo>) => Promise<void>;
  updateSentimentStatus: (sentimentId: string, status: SentimentStatus) => Promise<void>;
  deleteSentiments: (ids: string[]) => Promise<void>;
  associateEvents: (selectedIds: string[], primaryEventId: string) => Promise<void>;
  reportSentiments: (payload: ReportPayload) => Promise<void>;
  refreshSentiments: () => Promise<void>;
}

const SentimentDataContext = createContext<SentimentDataContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return '请求失败';
}

function sortSentiments(items: SentimentInfo[]) {
  return [...items].sort(
    (left, right) => new Date(right.publishTime || 0).getTime() - new Date(left.publishTime || 0).getTime(),
  );
}

function mergeSentiment(items: SentimentInfo[], sentiment: SentimentInfo) {
  const next = items.filter((item) => item.id !== sentiment.id);
  next.unshift(sentiment);
  return sortSentiments(next);
}

function patchSentiment(items: SentimentInfo[], sentimentId: string, updates: Partial<SentimentInfo>) {
  return sortSentiments(
    items.map((item) => (item.id === sentimentId ? { ...item, ...updates } : item)),
  );
}

export function SentimentDataProvider({ children }: { children: ReactNode }) {
  const [sentiments, setSentiments] = useState<SentimentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSentiments = useCallback(async () => {
    const nextSentiments = await appApi.getSentiments();
    setSentiments(sortSentiments(nextSentiments));
    return nextSentiments;
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadSentiments();
      } catch (error) {
        console.error('Failed to load sentiments', error);
        toast.error(`加载舆情失败：${getErrorMessage(error)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadSentiments]);

  const addSentiment = useCallback(async (sentiment: SentimentInfo) => {
    setSentiments((prev) => mergeSentiment(prev, sentiment));

    try {
      await appApi.addSentiment(sentiment);
      await loadSentiments();
      toast.success('舆情已保存');
    } catch (error) {
      setSentiments((prev) => prev.filter((item) => item.id !== sentiment.id));
      console.error('Failed to add sentiment', error);
      toast.error(`保存失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const updateSentiment = useCallback(async (sentimentId: string, updates: Partial<SentimentInfo>) => {
    setSentiments((prev) => patchSentiment(prev, sentimentId, updates));

    try {
      await appApi.updateSentiment(sentimentId, updates);
      await loadSentiments();
      toast.success('舆情已更新');
    } catch (error) {
      await loadSentiments().catch(() => undefined);
      console.error('Failed to update sentiment', error);
      toast.error(`更新失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const updateSentimentStatus = useCallback(async (sentimentId: string, status: SentimentStatus) => {
    setSentiments((prev) => patchSentiment(prev, sentimentId, { status }));

    try {
      await appApi.updateSentimentStatus(sentimentId, status);
      await loadSentiments();
    } catch (error) {
      await loadSentiments().catch(() => undefined);
      console.error('Failed to update sentiment status', error);
      toast.error(`状态更新失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const deleteSentiments = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    setSentiments((prev) => prev.filter((item) => !idSet.has(item.id)));

    try {
      await appApi.deleteSentiments(ids);
      await loadSentiments();
      toast.success(`已删除 ${ids.length} 条舆情`);
    } catch (error) {
      await loadSentiments().catch(() => undefined);
      console.error('Failed to delete sentiments', error);
      toast.error(`删除失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const associateEvents = useCallback(async (selectedIds: string[], primaryEventId: string) => {
    try {
      await appApi.associateEvents(selectedIds, primaryEventId);
      await loadSentiments();
      toast.success('关联已保存');
    } catch (error) {
      console.error('Failed to associate events', error);
      toast.error(`关联失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const reportSentiments = useCallback(async (payload: ReportPayload) => {
    try {
      await appApi.reportSentiments(payload);
      await loadSentiments();
      toast.success('报送已保存');
    } catch (error) {
      console.error('Failed to report sentiments', error);
      toast.error(`报送失败：${getErrorMessage(error)}`);
      throw error;
    }
  }, [loadSentiments]);

  const value = useMemo<SentimentDataContextValue>(() => ({
    sentiments,
    loading,
    addSentiment,
    updateSentiment,
    updateSentimentStatus,
    deleteSentiments,
    associateEvents,
    reportSentiments,
    refreshSentiments: loadSentiments,
  }), [
    sentiments,
    loading,
    addSentiment,
    updateSentiment,
    updateSentimentStatus,
    deleteSentiments,
    associateEvents,
    reportSentiments,
    loadSentiments,
  ]);

  return (
    <SentimentDataContext.Provider value={value}>
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
