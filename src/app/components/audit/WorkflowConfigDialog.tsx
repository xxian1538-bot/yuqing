import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TargetOptionGroup, TargetPickerDialog } from '../TargetPickerDialog';
import type { WorkflowConfig, WorkflowScene } from '../../types';
import { assignmentTargetGroups, getAssignmentTargetLabel } from '../../utils/assignmentTargets';
import { workflowModeLabels, workflowSceneLabels } from '../../utils/workflow';

interface WorkflowConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene: WorkflowScene;
  workflow: WorkflowConfig | null;
  onSubmit: (workflow: WorkflowConfig) => void;
}

function buildDefaultSteps() {
  return [1, 2, 3].map((level) => ({
    id: `step-${Date.now()}-${level}`,
    name: `${level}级审核`,
    targets: [] as string[],
  }));
}

export function WorkflowConfigDialog({
  open,
  onOpenChange,
  scene,
  workflow,
  onSubmit,
}: WorkflowConfigDialogProps) {
  const [draft, setDraft] = useState<WorkflowConfig>({
    id: '',
    name: '',
    scene,
    mode: 'any',
    isDefault: false,
    enabled: true,
    steps: buildDefaultSteps(),
    updatedAt: '',
  });
  const [stepPickerIndex, setStepPickerIndex] = useState<number | null>(null);

  const targetGroups: TargetOptionGroup[] = useMemo(() => assignmentTargetGroups.map((group) => ({
    key: group.key,
    label: group.label,
    options: [...group.options],
  })), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (workflow) {
      setDraft({
        ...workflow,
        scene,
        steps: workflow.steps.length > 0 ? workflow.steps : buildDefaultSteps(),
      });
      return;
    }

    setDraft({
      id: `wf-${scene}-${Date.now()}`,
      name: '',
      scene,
      mode: 'any',
      isDefault: false,
      enabled: true,
      steps: buildDefaultSteps(),
      updatedAt: '',
    });
  }, [open, workflow, scene]);

  const currentStepTargets = stepPickerIndex === null ? [] : draft.steps[stepPickerIndex]?.targets || [];

  const handleStepTargetsChange = (targets: string[]) => {
    if (stepPickerIndex === null) {
      return;
    }

    setDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step, index) => (
        index === stepPickerIndex ? { ...step, targets } : step
      )),
    }));
  };

  const handleSubmit = () => {
    if (!draft.name.trim()) {
      alert('请输入审核流名称');
      return;
    }

    if (draft.steps.length === 0) {
      alert('至少保留一级审核');
      return;
    }

    if (draft.steps.some((step) => step.targets.length === 0)) {
      alert('请为每个审核层级选择审核对象');
      return;
    }

    onSubmit({
      ...draft,
      scene,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[96rem] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{workflow ? '编辑审核流' : '新增审核流'} · {workflowSceneLabels[scene]}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>审核流名称</Label>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="请输入审核流名称"
                />
              </div>

              <div className="space-y-2">
                <Label>审核方式</Label>
                <Select
                  value={draft.mode}
                  onValueChange={(value) => setDraft((prev) => ({ ...prev, mode: value as WorkflowConfig['mode'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">或签</SelectItem>
                    <SelectItem value="all">会签</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">审核层级</div>
                  <div className="text-xs text-gray-500">默认三级审核，可继续增减层级</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDraft((prev) => ({
                    ...prev,
                    steps: [
                      ...prev.steps,
                      {
                        id: `step-${Date.now()}-${prev.steps.length + 1}`,
                        name: `${prev.steps.length + 1}级审核`,
                        targets: [],
                      },
                    ],
                  }))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新增层级
                </Button>
              </div>

              <div className="space-y-3">
                {draft.steps.map((step, index) => (
                  <div key={step.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <Label>层级名称</Label>
                        <Input
                          value={step.name}
                          onChange={(event) => setDraft((prev) => ({
                            ...prev,
                            steps: prev.steps.map((item, itemIndex) => (
                              itemIndex === index ? { ...item, name: event.target.value } : item
                            )),
                          }))}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={draft.steps.length <= 1}
                        onClick={() => setDraft((prev) => ({
                          ...prev,
                          steps: prev.steps.filter((_, itemIndex) => itemIndex !== index).map((item, reorderIndex) => ({
                            ...item,
                            name: item.name || `${reorderIndex + 1}级审核`,
                          })),
                        }))}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>审核对象</Label>
                        <Button variant="outline" size="sm" onClick={() => setStepPickerIndex(index)}>
                          <Users className="mr-2 h-4 w-4" />
                          选择人员/角色/职位
                        </Button>
                      </div>

                      <div className="flex min-h-14 flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                        {step.targets.length > 0 ? step.targets.map((targetId) => (
                          <Badge key={targetId} variant="outline" className="bg-white">
                            {getAssignmentTargetLabel(targetId)}
                          </Badge>
                        )) : (
                          <span className="text-sm text-gray-500">尚未选择审核对象</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              当前配置：{draft.steps.length} 级审核 · {workflowModeLabels[draft.mode]}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit}>保存流程</Button>
          </div>
        </DialogContent>
      </Dialog>

      <TargetPickerDialog
        open={stepPickerIndex !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setStepPickerIndex(null);
          }
        }}
        groups={targetGroups}
        selectedTargets={currentStepTargets}
        onConfirm={handleStepTargetsChange}
      />
    </>
  );
}
