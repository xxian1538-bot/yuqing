import { useMemo, useState } from 'react';
import { Plus, Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';
import type { WorkflowConfig, WorkflowScene } from '../../types';
import { getAssignmentTargetLabel } from '../../utils/assignmentTargets';
import { workflowModeLabels, workflowSceneLabels } from '../../utils/workflow';
import { WorkflowConfigDialog } from './WorkflowConfigDialog';

const sceneOrder: WorkflowScene[] = ['disposal', 'comment'];

export function WorkflowConfigPage() {
  const {
    workflowConfigs,
    updateWorkflowConfig,
    createWorkflowConfig,
    deleteWorkflowConfig,
    setDefaultWorkflowConfig,
  } = useTaskWorkflow();
  const [editingScene, setEditingScene] = useState<WorkflowScene>('disposal');
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupedWorkflows = useMemo(() => Object.fromEntries(sceneOrder.map((scene) => [
    scene,
    workflowConfigs.filter((workflow) => workflow.scene === scene),
  ])), [workflowConfigs]) as Record<WorkflowScene, WorkflowConfig[]>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">工作流配置</h1>
      </div>

      <div className="space-y-8">
        {sceneOrder.map((scene) => (
          <div key={scene} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{workflowSceneLabels[scene]}</h2>
                <p className="text-sm text-gray-500">可配置多条审核流，并指定其中一条作为默认流程。</p>
              </div>
              <Button
                onClick={() => {
                  setEditingScene(scene);
                  setEditingWorkflow(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新增审核流
              </Button>
            </div>

            <div className="space-y-4">
              {groupedWorkflows[scene].map((workflow) => (
                <div key={workflow.id} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-gray-900">{workflow.name}</div>
                        {workflow.isDefault ? <Badge className="bg-amber-100 text-amber-700">默认</Badge> : null}
                        <Badge variant="outline">{workflow.steps.length}级审核</Badge>
                        <Badge variant="outline">{workflowModeLabels[workflow.mode]}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">最近更新时间：{workflow.updatedAt}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <div className="mr-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        <span className="text-sm text-gray-600">启用状态</span>
                        <Switch
                          checked={workflow.enabled}
                          aria-label={`${workflow.name}启用状态`}
                          onCheckedChange={(checked) => updateWorkflowConfig(workflow.id, { enabled: Boolean(checked) })}
                        />
                        <span className={workflow.enabled ? 'text-sm text-blue-600' : 'text-sm text-gray-500'}>
                          {workflow.enabled ? '已启用' : '已停用'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setDefaultWorkflowConfig(workflow.id, workflow.scene)}>
                        <Star className="mr-2 h-4 w-4" />
                        设为默认
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingScene(workflow.scene);
                          setEditingWorkflow(workflow);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteWorkflowConfig(workflow.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline">第 {index + 1} 级</Badge>
                            <span className="text-sm font-medium text-gray-900">{step.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {step.targets.map((targetId) => (
                              <Badge key={targetId} variant="outline" className="bg-white">
                                {getAssignmentTargetLabel(targetId)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {groupedWorkflows[scene].length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
                  当前场景还没有审核流，请先新增一条流程。
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <WorkflowConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        scene={editingScene}
        workflow={editingWorkflow}
        onSubmit={(workflow) => {
          if (editingWorkflow) {
            updateWorkflowConfig(editingWorkflow.id, workflow);
            return;
          }
          createWorkflowConfig(workflow);
        }}
      />
    </div>
  );
}
