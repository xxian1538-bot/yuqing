import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../ui/textarea";
import { DisposalTask } from "../../types";

interface HandleDisposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DisposalTask | null;
  onSubmit: (details: string, attachment: string, completedAt: string) => void;
}

export function HandleDisposalDialog({ open, onOpenChange, task, onSubmit }: HandleDisposalProps) {
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState('');
  const [completedAt, setCompletedAt] = useState('');

  useEffect(() => {
    if (open) {
      setDetails(task?.result || task?.progress || '');
      setAttachment('');
      setCompletedAt(task?.completedAt?.replace(' ', 'T') || '');
    }
  }, [open, task]);

  const handleSubmit = () => {
    if (!details.trim()) {
      alert('请输入任务执行内容');
      return;
    }
    onSubmit(details, attachment, completedAt.replace('T', ' '));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[56rem] bg-white">
        <DialogHeader>
          <DialogTitle>执行处置任务</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>任务执行内容</Label>
            <Textarea 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              className="min-h-28"
              placeholder="请输入本次任务执行情况、处置结果和关键内容..." 
            />
          </div>
          <div className="space-y-2">
            <Label>执行时间</Label>
            <Input
              type="datetime-local"
              value={completedAt}
              onChange={e => setCompletedAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>附件上传 (图片/视频/文档)</Label>
            <Input 
              type="file" 
              onChange={e => setAttachment("已上传文件")} 
            />
            {attachment && <p className="text-xs text-green-600 mt-1">{attachment}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">保存执行记录</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
