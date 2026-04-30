import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface SentimentClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentTitle: string;
  onConfirm: (note: string) => void;
}

export function SentimentClosureDialog({
  open,
  onOpenChange,
  sentimentTitle,
  onConfirm,
}: SentimentClosureDialogProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[42rem] bg-white">
        <DialogHeader>
          <DialogTitle>领导确认完结</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            当前将对舆情事件“{sentimentTitle}”执行领导确认完结。确认后，舆情任务状态将更新为“已完结”。
          </div>

          <div className="space-y-2">
            <Label>完结说明</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-28"
              placeholder="请输入领导确认完结的依据、结果摘要和后续要求"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            onClick={() => {
              if (!note.trim()) {
                return;
              }
              onConfirm(note.trim());
              onOpenChange(false);
            }}
          >
            确认完结
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
