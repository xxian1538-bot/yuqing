import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import type { SentimentInfo } from '../types';

interface SentimentPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentiments: SentimentInfo[];
  selectedId?: string;
  onConfirm: (sentiment: SentimentInfo | null) => void;
  title?: string;
}

export function SentimentPickerDialog({
  open,
  onOpenChange,
  sentiments,
  selectedId,
  onConfirm,
  title = '选择关联舆情',
}: SentimentPickerDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [draftSelectedId, setDraftSelectedId] = useState<string | undefined>(selectedId);

  useEffect(() => {
    if (open) {
      setDraftSelectedId(selectedId);
      setKeyword('');
    }
  }, [open, selectedId]);

  const visibleSentiments = useMemo(() => sentiments.filter((sentiment) => {
    const text = `${sentiment.title}${sentiment.summary}${sentiment.unit}${sentiment.source}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  }), [keyword, sentiments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[72rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索舆情标题、摘要、单位、来源"
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {visibleSentiments.length > 0 ? visibleSentiments.map((sentiment) => {
              const active = draftSelectedId === sentiment.id;

              return (
                <button
                  key={sentiment.id}
                  type="button"
                  onClick={() => setDraftSelectedId(sentiment.id)}
                  className={`w-full rounded-md border p-4 text-left transition-colors ${
                    active ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{sentiment.title}</span>
                    <Badge variant="outline">{sentiment.level}</Badge>
                    <Badge variant="outline">{sentiment.status}</Badge>
                  </div>
                  <div className="mb-2 text-xs text-gray-500">
                    {sentiment.publishTime} · {sentiment.unit} · {sentiment.source}
                  </div>
                  <div className="text-sm leading-6 text-gray-600">{sentiment.summary}</div>
                </button>
              );
            }) : (
              <div className="rounded-md border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                未找到匹配的舆情事件
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            onClick={() => {
              onConfirm(sentiments.find((item) => item.id === draftSelectedId) || null);
              onOpenChange(false);
            }}
          >
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
