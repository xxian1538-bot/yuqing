import type {
  CommentTask,
  DisposalTask,
  ReviewRequest,
  ScoringWeights,
  SentimentClosureRecord,
  SentimentInfo,
  SentimentStatus,
  WorkflowConfig,
  WorkflowScene,
} from '../types';

export interface AssignTaskPayload {
  sentimentId: string;
  sentimentTitle: string;
  sentimentLevel: DisposalTask['level'];
  taskType: 'disposal' | 'comment';
  deadline: string;
  assigneeLabel: string;
  assignmentTargets: string[];
  referenceEventIds: string[];
  measures?: string;
  postCount?: number;
  platforms?: string[];
  contentDirection?: string;
}

export interface SubmitDisposalPayload {
  taskId: string;
  details: string;
  attachment: string;
  completedAt: string;
  workflowConfigId: string;
}

export interface SubmitCommentPayload {
  taskId: string;
  submission: CommentTask['submissions'][number];
  submitForReview: boolean;
  workflowConfigId?: string;
}

export interface ReportPayload {
  sentimentIds: string[];
  targetType: string;
  target: string;
  reportNote: string;
}

export interface TaskWorkflowState {
  disposalTasks: DisposalTask[];
  commentTasks: CommentTask[];
  reviewRequests: ReviewRequest[];
  closureRecords: SentimentClosureRecord[];
  workflowConfigs: WorkflowConfig[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const appApi = {
  getSentiments: () => request<SentimentInfo[]>('/api/sentiments'),
  addSentiment: (sentiment: SentimentInfo) => request('/api/sentiments', {
    method: 'POST',
    body: JSON.stringify({ sentiment }),
  }),
  updateSentiment: (sentimentId: string, updates: Partial<SentimentInfo>) => request(`/api/sentiments/${sentimentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  }),
  updateSentimentStatus: (sentimentId: string, status: SentimentStatus) => request('/api/sentiments/status', {
    method: 'POST',
    body: JSON.stringify({ sentimentId, status }),
  }),
  associateEvents: (selectedIds: string[], primaryEventId: string) => request('/api/sentiments/associate', {
    method: 'POST',
    body: JSON.stringify({ selectedIds, primaryEventId }),
  }),
  reportSentiments: (payload: ReportPayload) => request('/api/sentiments/report', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getTaskWorkflow: () => request<TaskWorkflowState>('/api/task-workflow'),
  createAssignedTask: (payload: AssignTaskPayload) => request('/api/tasks/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  createDisposalTask: (task: DisposalTask) => request('/api/tasks/disposal', {
    method: 'POST',
    body: JSON.stringify({ task }),
  }),
  createCommentTask: (task: CommentTask) => request('/api/tasks/comment', {
    method: 'POST',
    body: JSON.stringify({ task }),
  }),
  acceptDisposalTask: (taskId: string) => request('/api/tasks/disposal/accept', {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  }),
  submitDisposalForReview: (payload: SubmitDisposalPayload) => request('/api/tasks/disposal/submit-review', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  submitCommentExecution: (payload: SubmitCommentPayload) => request('/api/tasks/comment/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  approveReview: (reviewId: string, comment: string) => request('/api/reviews/approve', {
    method: 'POST',
    body: JSON.stringify({ reviewId, comment }),
  }),
  rejectReview: (reviewId: string, comment: string) => request('/api/reviews/reject', {
    method: 'POST',
    body: JSON.stringify({ reviewId, comment }),
  }),
  updateWorkflowConfig: (workflowId: string, updates: Partial<WorkflowConfig>) => request(`/api/workflows/${workflowId}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  }),
  createWorkflowConfig: (workflow: WorkflowConfig) => request('/api/workflows', {
    method: 'POST',
    body: JSON.stringify({ workflow }),
  }),
  deleteWorkflowConfig: (workflowId: string) => request(`/api/workflows/${workflowId}`, {
    method: 'DELETE',
  }),
  setDefaultWorkflowConfig: (workflowId: string, scene: WorkflowScene) => request(`/api/workflows/${workflowId}/set-default`, {
    method: 'POST',
    body: JSON.stringify({ scene }),
  }),
  confirmSentimentClosure: (sentimentId: string, note: string) => request('/api/sentiments/closure', {
    method: 'POST',
    body: JSON.stringify({ sentimentId, note }),
  }),
  getScoringWeights: () => request<ScoringWeights>('/api/scoring-config'),
  updateScoringWeights: (weights: ScoringWeights) => request('/api/scoring-config', {
    method: 'PUT',
    body: JSON.stringify({ weights }),
  }),
};
