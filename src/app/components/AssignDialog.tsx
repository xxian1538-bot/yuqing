import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { ReferenceCasePickerDialog } from './ReferenceCasePickerDialog';
import { TargetOptionGroup, TargetPickerDialog } from './TargetPickerDialog';
import type { SentimentLevel } from '../types';
import { assignmentTargetGroups, getAssignmentTargetLabel } from '../utils/assignmentTargets';

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentIds: string[];
  sentimentLevel?: SentimentLevel | string;
}

const targetGroups: TargetOptionGroup[] = assignmentTargetGroups.map((group) => ({
  key: group.key,
  label: group.label,
  options: [...group.options],
}));

export function AssignDialog({ open, onOpenChange, sentimentIds, sentimentLevel }: AssignDialogProps) {
  const [taskType, setTaskType] = useState<'disposal' | 'comment'>('disposal');
  const [deadline, setDeadline] = useState('');
  const [measures, setMeasures] = useState('');
  const [postCount, setPostCount] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [contentDirection, setContentDirection] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [referenceEventIds, setReferenceEventIds] = useState<string[]>([]);
  const [isTargetPickerOpen, setIsTargetPickerOpen] = useState(false);
  const [isReferencePickerOpen, setIsReferencePickerOpen] = useState(false);

  const { sentiments } = useSentimentData();
  const { createAssignedTask, disposalTasks } = useTaskWorkflow();
  const selectedSentiments = sentiments.filter((item) => sentimentIds.includes(item.id));
  const isBatch = sentimentIds.length > 1;
  const levelOrder: Record<SentimentLevel, number> = {
    轻微: 1,
    一般: 2,
    较大: 3,
    重大: 4,
    特别重大: 5,
  };
  const highestLevel = selectedSentiments.reduce<SentimentLevel | undefined>((current, item) => {
    if (!current) return item.level;
    return levelOrder[item.level] > levelOrder[current] ? item.level : current;
  }, sentimentLevel as SentimentLevel | undefined);

  const historicalReferences = sentiments
    .filter((sentiment) => sentiment.status === '已办结' && !sentimentIds.includes(sentiment.id))
    .map((sentiment) => {
      const latestDisposal = disposalTasks
        .filter((task) => task.sentimentId === sentiment.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        sentiment,
        result: latestDisposal?.result || latestDisposal?.progress || sentiment.analysis,
      };
    });

  const selectedTargetLabels = useMemo(() => selectedTargets.map(getAssignmentTargetLabel), [selectedTargets]);

  const selectedReferenceItems = useMemo(() => historicalReferences.filter(({ sentiment }) => (
    referenceEventIds.includes(sentiment.id)
  )), [historicalReferences, referenceEventIds]);

  const handleSubmit = () => {
    if (selectedSentiments.length === 0) {
      return;
    }

    if (!deadline || selectedTargets.length === 0) {
      alert('请先选择处理对象并填写截止时间');
      return;
    }

    selectedSentiments.forEach((sentiment) => {
      createAssignedTask({
        sentimentId: sentiment.id,
        sentimentTitle: sentiment.title,
        sentimentLevel: sentiment.level,
        taskType,
        deadline: deadline.replace('T', ' '),
        assigneeLabel: selectedTargetLabels.join('、'),
        assignmentTargets: selectedTargets,
        referenceEventIds,
        measures,
        postCount: Number(postCount) || undefined,
        platforms: platforms.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        contentDirection,
      });
    });

    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setTaskType('disposal');
      setDeadline('');
      setMeasures('');
      setPostCount('');
      setPlatforms('');
      setContentDirection('');
      setSelectedTargets([]);
      setReferenceEventIds([]);
    }
  }, [open, sentimentIds.join(',')]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[42rem] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>舆情指派</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              {isBatch
                ? `当前已选择 ${sentimentIds.length} 条舆情，最高等级为 `
                : '当前舆情等级为 '}
              <strong>{highestLevel || sentimentLevel}</strong>
              ，可发起线下处置任务或线上网评任务。
            </div>

            <div className="space-y-2">
              <Label>选择任务类型</Label>
              <Select value={taskType} onValueChange={(value: 'disposal' | 'comment') => setTaskType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disposal">处置任务</SelectItem>
                  <SelectItem value="comment">网评任务</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>处理对象</Label>
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
              <Label>截止时间</Label>
              <Input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
            </div>

            {taskType === 'disposal' ? (
              <div className="space-y-2">
                <Label>处置措施与要求</Label>
                <Textarea
                  value={measures}
                  onChange={(event) => setMeasures(event.target.value)}
                  className="min-h-24"
                  placeholder="请输入需要执行的处置动作"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>要求发帖数量</Label>
                  <Input type="number" min="1" value={postCount} onChange={(event) => setPostCount(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>目标发布平台</Label>
                  <Input value={platforms} onChange={(event) => setPlatforms(event.target.value)} placeholder="例如：微博，知乎，抖音" />
                </div>
                <div className="space-y-2">
                  <Label>内容导向 / 话术要求</Label>
                  <Textarea
                    value={contentDirection}
                    onChange={(event) => setContentDirection(event.target.value)}
                    className="min-h-24"
                    placeholder="请输入网评内容方向"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>历史舆情参考案例</Label>
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
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发任务</Button>
          </div>
        </DialogContent>
      </Dialog>

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
