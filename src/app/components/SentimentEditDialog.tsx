import { useEffect, useState } from 'react';
import type { SentimentInfo, SentimentLevel } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface SentimentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentiment: SentimentInfo | null;
  onSubmit: (updates: Partial<SentimentInfo>) => void;
}

export function SentimentEditDialog({ open, onOpenChange, sentiment, onSubmit }: SentimentEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    source: '',
    publishTime: '',
    level: '一般' as SentimentLevel,
    analysis: '',
    link: '',
  });

  useEffect(() => {
    if (!sentiment) {
      return;
    }

    setFormData({
      title: sentiment.title,
      summary: sentiment.summary,
      content: sentiment.content,
      source: sentiment.source,
      publishTime: sentiment.publishTime,
      level: sentiment.level,
      analysis: sentiment.analysis,
      link: sentiment.link,
    });
  }, [sentiment]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>编辑舆情事件</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>事件标题</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>来源平台</Label>
              <Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>发布时间</Label>
              <Input value={formData.publishTime} onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>事件等级</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value as SentimentLevel })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="轻微">轻微</SelectItem>
                  <SelectItem value="一般">一般</SelectItem>
                  <SelectItem value="较大">较大</SelectItem>
                  <SelectItem value="重大">重大</SelectItem>
                  <SelectItem value="特别重大">特别重大</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>原文链接</Label>
              <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>内容摘要</Label>
              <Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="min-h-20" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>完整内容</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="min-h-36" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>研判建议</Label>
              <Textarea value={formData.analysis} onChange={(e) => setFormData({ ...formData, analysis: e.target.value })} className="min-h-24" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">保存更新</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
