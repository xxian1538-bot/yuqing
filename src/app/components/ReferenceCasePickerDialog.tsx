import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import type { SentimentInfo } from '../types';

interface ReferenceCaseItem {
  sentiment: SentimentInfo;
  result: string;
}

interface ReferenceCasePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: ReferenceCaseItem[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

export function ReferenceCasePickerDialog({
  open,
  onOpenChange,
  cases,
  selectedIds,
  onConfirm,
}: ReferenceCasePickerDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (open) {
      setDraftSelection(selectedIds);
    }
  }, [open, selectedIds]);

  const visibleCases = useMemo(() => cases.filter(({ sentiment, result }) => {
    const text = `${sentiment.title}${sentiment.unit}${result}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  }), [cases, keyword]);

  const toggle = (id: string, checked: boolean) => {
    setDraftSelection((prev) => (
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[72rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>选择历史参考案例</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索舆情标题、单位、处置结果"
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {visibleCases.length > 0 ? visibleCases.map(({ sentiment, result }) => (
              <label
                key={sentiment.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-4 hover:bg-gray-50"
              >
                <Checkbox
                  checked={draftSelection.includes(sentiment.id)}
                  onCheckedChange={(checked) => toggle(sentiment.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{sentiment.title}</span>
                    <Badge variant="outline">{sentiment.level}</Badge>
                  </div>
                  <div className="mb-2 text-xs text-gray-500">
                    {sentiment.publishTime} · {sentiment.unit}
                  </div>
                  <div className="text-sm leading-6 text-gray-600">{result}</div>
                </div>
              </label>
            )) : (
              <div className="rounded-md border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                未找到匹配的历史案例
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => {
            onConfirm(draftSelection);
            onOpenChange(false);
          }}>确认选择</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
