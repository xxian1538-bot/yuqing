import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TargetOptionGroup, TargetPickerDialog } from '../TargetPickerDialog';
import { ReferenceCasePickerDialog } from '../ReferenceCasePickerDialog';
import { SentimentPickerDialog } from '../SentimentPickerDialog';
import type { DisposalTask, SentimentLevel } from '../../types';
import { assignmentTargetGroups, getAssignmentTargetLabel } from '../../utils/assignmentTargets';
import { useSentimentData } from '../../context/SentimentDataContext';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';

interface CreateDisposalTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: DisposalTask) => void;
}

export function CreateDisposalTask({ open, onOpenChange, onSubmit }: CreateDisposalTaskProps) {
  const [isSentimentPickerOpen, setIsSentimentPickerOpen] = useState(false);
  const [isTargetPickerOpen, setIsTargetPickerOpen] = useState(false);
  const [isReferencePickerOpen, setIsReferencePickerOpen] = useState(false);
  const [selectedSentimentId, setSelectedSentimentId] = useState<string>('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [referenceEventIds, setReferenceEventIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    level: '一般' as SentimentLevel,
    deadline: '',
    measures: '',
  });
  const { sentiments } = useSentimentData();
  const { disposalTasks } = useTaskWorkflow();

  const targetGroups: TargetOptionGroup[] = assignmentTargetGroups.map((group) => ({
    key: group.key,
    label: group.label,
    options: [...group.options],
  }));

  const selectedTargetLabels = useMemo(
    () => selectedTargets.map(getAssignmentTargetLabel),
    [selectedTargets],
  );
  const selectedSentiment = sentiments.find((item) => item.id === selectedSentimentId);
  const historicalReferences = sentiments
    .filter((sentiment) => sentiment.status === '已办结' && sentiment.id !== selectedSentimentId)
    .map((sentiment) => {
      const latestDisposal = disposalTasks
        .filter((task) => task.sentimentId === sentiment.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        sentiment,
        result: latestDisposal?.result || latestDisposal?.progress || sentiment.analysis,
      };
    });
  const selectedReferenceItems = useMemo(
    () => historicalReferences.filter(({ sentiment }) => referenceEventIds.includes(sentiment.id)),
    [historicalReferences, referenceEventIds],
  );

  const handleSubmit = () => {
    if (!selectedSentiment || selectedTargets.length === 0 || !formData.deadline) {
      alert("请填写必填项（标题、负责人、截止时间）");
      return;
    }

    const newTask: DisposalTask = {
      id: String(Date.now()),
      sentimentId: selectedSentiment.id,
      sentimentTitle: selectedSentiment.title,
      level: formData.level,
      assignee: selectedTargetLabels.join('、'),
      deadline: formData.deadline.replace('T', ' '),
      status: '未接收',
      progress: '等待接收',
      measures: formData.measures,
      evidence: [],
      result: '',
      assignmentTargets: selectedTargets,
      referenceEventIds,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    onSubmit(newTask);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      level: '一般',
      deadline: '',
      measures: '',
    });
    setSelectedSentimentId('');
    setSelectedTargets([]);
    setReferenceEventIds([]);
  };

  useEffect(() => {
    if (!open) {
      setSelectedTargets([]);
      setReferenceEventIds([]);
      setFormData({
        level: '一般',
        deadline: '',
        measures: '',
      });
      setSelectedSentimentId('');
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[84rem] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建处置任务</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-red-500">* <span className="text-gray-700">关联舆情</span></Label>
                <Button variant="outline" size="sm" onClick={() => setIsSentimentPickerOpen(true)}>
                  选择关联舆情
                </Button>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                {selectedSentiment ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{selectedSentiment.title}</span>
                      <Badge variant="outline">{selectedSentiment.level}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedSentiment.publishTime} · {selectedSentiment.unit}
                    </div>
                    <div className="text-sm text-gray-600">{selectedSentiment.summary}</div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">尚未选择关联舆情</span>
                )}
              </div>
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
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-red-500">* <span className="text-gray-700">负责人</span></Label>
                  <Button variant="outline" size="sm" onClick={() => setIsTargetPickerOpen(true)}>
                    选择处理对象
                  </Button>
                </div>
                <div className="flex min-h-14 flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                  {selectedTargetLabels.length > 0 ? selectedTargetLabels.map((label) => (
                    <Badge key={label} variant="outline" className="bg-white">{label}</Badge>
                  )) : (
                    <span className="text-sm text-gray-500">尚未选择处理对象</span>
                  )}
                </div>
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

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between gap-3">
                <Label>历史参考案例</Label>
                <Button variant="outline" size="sm" onClick={() => setIsReferencePickerOpen(true)}>
                  选择参考案例
                </Button>
              </div>
              <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                {selectedReferenceItems.length > 0 ? selectedReferenceItems.map(({ sentiment }) => (
                  <div key={sentiment.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                    <div className="min-w-0 text-sm text-gray-700">{sentiment.title}</div>
                    <Badge variant="outline">{sentiment.level}</Badge>
                  </div>
                )) : (
                  <span className="text-sm text-gray-500">尚未选择历史参考案例</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发</Button>
          </div>
        </DialogContent>
      </Dialog>

      <SentimentPickerDialog
        open={isSentimentPickerOpen}
        onOpenChange={setIsSentimentPickerOpen}
        sentiments={sentiments}
        selectedId={selectedSentimentId}
        onConfirm={(sentiment) => {
          setSelectedSentimentId(sentiment?.id || '');
          if (sentiment) {
            setFormData((prev) => ({ ...prev, level: sentiment.level }));
          }
        }}
      />

      <TargetPickerDialog
        open={isTargetPickerOpen}
        onOpenChange={setIsTargetPickerOpen}
        groups={targetGroups}
        selectedTargets={selectedTargets}
        onConfirm={setSelectedTargets}
      />

      <ReferenceCasePickerDialog
        open={isReferencePickerOpen}
        onOpenChange={setIsReferencePickerOpen}
        cases={historicalReferences}
        selectedIds={referenceEventIds}
        onConfirm={setReferenceEventIds}
      />
    </>
  );
}
