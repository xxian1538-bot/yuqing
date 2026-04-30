import type { WorkflowConfig, WorkflowMode, WorkflowScene } from '../types';

export const workflowSceneLabels: Record<WorkflowScene, string> = {
  disposal: '处置任务完结审核',
  comment: '网评任务完结审核',
};

export const workflowModeLabels: Record<WorkflowMode, string> = {
  any: '或签',
  all: '会签',
};

export function getWorkflowSummary(workflow: WorkflowConfig) {
  return `${workflow.name} · ${workflow.steps.length}级 · ${workflowModeLabels[workflow.mode]}`;
}
