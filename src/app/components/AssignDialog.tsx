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
import { getPresetDeadline } from '../utils/sentimentDeadline';

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

type AssignTaskType = 'disposal' | 'comment' | 'notification';

interface TaskDraft {
  id: string;
  taskType: AssignTaskType;
  deadline: string;
  measures: string;
  postCount: string;
  platforms: string;
  contentDirection: string;
}

function createTaskDraft(level?: SentimentLevel | string): TaskDraft {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    taskType: 'disposal',
    deadline: getPresetDeadline((level as SentimentLevel) || '一般'),
    measures: '',
    postCount: '',
    platforms: '',
    contentDirection: '',
  };
}

export function AssignDialog({ open, onOpenChange, sentimentIds, sentimentLevel }: AssignDialogProps) {
  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>(() => [createTaskDraft(sentimentLevel)]);
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

    if (selectedTargets.length === 0 || taskDrafts.some((task) => !task.deadline)) {
      alert('请先选择处理对象，并为每个任务填写截止时间');
      return;
    }

    void (async () => {
      const requests = selectedSentiments.flatMap((sentiment) => (
        selectedTargets.flatMap((target) => (
          taskDrafts.map((task) => createAssignedTask({
            sentimentId: sentiment.id,
            sentimentTitle: sentiment.title,
            sentimentLevel: sentiment.level,
            taskType: task.taskType,
            deadline: task.deadline.replace('T', ' '),
            assigneeLabel: getAssignmentTargetLabel(target),
            assignmentTargets: [target],
            referenceEventIds,
            measures: task.measures,
            postCount: Number(task.postCount) || undefined,
            platforms: task.platforms.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
            contentDirection: task.contentDirection,
          }))
        ))
      ));

      await Promise.all(requests);
      onOpenChange(false);
    })();
  };

  useEffect(() => {
    if (!open) {
      setTaskDrafts([createTaskDraft(sentimentLevel)]);
      setSelectedTargets([]);
      setReferenceEventIds([]);
    }
  }, [open, sentimentIds.join(',')]);

  const updateTaskDraft = (id: string, updates: Partial<TaskDraft>) => {
    setTaskDrafts((current) => current.map((task) => (
      task.id === id ? { ...task, ...updates } : task
    )));
  };

  const addTaskDraft = () => {
    setTaskDrafts((current) => [...current, createTaskDraft(highestLevel || sentimentLevel)]);
  };

  const removeTaskDraft = (id: string) => {
    setTaskDrafts((current) => current.length > 1 ? current.filter((task) => task.id !== id) : current);
  };

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
              ，可一次给多个对象下发处置、网评或通知任务。
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

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>任务配置</Label>
                <Button variant="outline" size="sm" onClick={addTaskDraft}>
                  添加任务
                </Button>
              </div>

              {taskDrafts.map((task, index) => (
                <div key={task.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">任务 {index + 1}</div>
                    <Button variant="ghost" size="sm" disabled={taskDrafts.length === 1} onClick={() => removeTaskDraft(task.id)}>
                      删除
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>任务类型</Label>
                      <Select value={task.taskType} onValueChange={(value: AssignTaskType) => updateTaskDraft(task.id, { taskType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disposal">处置任务</SelectItem>
                          <SelectItem value="comment">网评任务</SelectItem>
                          <SelectItem value="notification">通知任务</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>截止时间</Label>
                      <Input type="datetime-local" value={task.deadline} onChange={(event) => updateTaskDraft(task.id, { deadline: event.target.value })} />
                    </div>
                  </div>

                  {task.taskType === 'disposal' ? (
                    <div className="space-y-2">
                      <Label>处置措施与要求</Label>
                      <Textarea
                        value={task.measures}
                        onChange={(event) => updateTaskDraft(task.id, { measures: event.target.value })}
                        className="min-h-20"
                        placeholder="请输入需要执行的处置动作"
                      />
                    </div>
                  ) : task.taskType === 'comment' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>要求发帖数量</Label>
                          <Input type="number" min="1" value={task.postCount} onChange={(event) => updateTaskDraft(task.id, { postCount: event.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>目标发布平台</Label>
                          <Input value={task.platforms} onChange={(event) => updateTaskDraft(task.id, { platforms: event.target.value })} placeholder="例如：微博，知乎，抖音" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>内容导向 / 话术要求</Label>
                        <Textarea
                          value={task.contentDirection}
                          onChange={(event) => updateTaskDraft(task.id, { contentDirection: event.target.value })}
                          className="min-h-20"
                          placeholder="请输入网评内容方向"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>通知内容</Label>
                      <Textarea
                        value={task.contentDirection}
                        onChange={(event) => updateTaskDraft(task.id, { contentDirection: event.target.value })}
                        className="min-h-20"
                        placeholder="请输入通知任务说明，处理人收到后确认知悉即可"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

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
