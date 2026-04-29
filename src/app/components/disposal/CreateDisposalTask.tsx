import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { DisposalTask, SentimentLevel } from '../../types';

interface CreateDisposalTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: DisposalTask) => void;
}

export function CreateDisposalTask({ open, onOpenChange, onSubmit }: CreateDisposalTaskProps) {
  const [formData, setFormData] = useState({
    title: '',
    level: '一般' as SentimentLevel,
    assignee: '',
    deadline: '',
    measures: '',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.assignee || !formData.deadline) {
      alert("请填写必填项（标题、负责人、截止时间）");
      return;
    }

    const newTask: DisposalTask = {
      id: String(Date.now()),
      sentimentId: `S-${Date.now()}`,
      sentimentTitle: formData.title,
      level: formData.level,
      assignee: formData.assignee,
      deadline: formData.deadline.replace('T', ' '),
      status: '未接收',
      progress: '等待接收',
      measures: formData.measures,
      evidence: [],
      result: '',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    onSubmit(newTask);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      title: '',
      level: '一般',
      assignee: '',
      deadline: '',
      measures: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[84rem] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建处置任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-red-500">* <span className="text-gray-700">任务/舆情标题</span></Label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="请输入处置任务的关联舆情标题" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>舆情等级</Label>
              <Select value={formData.level} onValueChange={(v: SentimentLevel) => setFormData({...formData, level: v})}>
                <SelectTrigger><SelectValue placeholder="选择等级" /></SelectTrigger>
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
              <Label className="text-red-500">* <span className="text-gray-700">负责人</span></Label>
              <Input 
                value={formData.assignee} 
                onChange={e => setFormData({...formData, assignee: e.target.value})} 
                placeholder="例如: 张三" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-red-500">* <span className="text-gray-700">截止时间</span></Label>
              <Input 
                type="datetime-local" 
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>处置措施与要求说明</Label>
            <textarea 
              value={formData.measures}
              onChange={e => setFormData({...formData, measures: e.target.value})}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="请输入具体的处置建议、处置方向或应对策略..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
