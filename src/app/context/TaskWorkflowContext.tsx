import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { appApi, type AssignTaskPayload, type SubmitCommentPayload, type SubmitDisposalPayload } from '../lib/api';
import { useSentimentData } from './SentimentDataContext';
import type {
  CommentTask,
  DisposalTask,
  ReviewRequest,
  SentimentClosureRecord,
  SentimentTaskStatus,
  WorkflowConfig,
} from '../types';
import { getSentimentTaskStatus } from '../utils/taskWorkflow';

interface TaskWorkflowContextValue {
  disposalTasks: DisposalTask[];
  commentTasks: CommentTask[];
  reviewRequests: ReviewRequest[];
  closureRecords: SentimentClosureRecord[];
  workflowConfigs: WorkflowConfig[];
  createAssignedTask: (payload: AssignTaskPayload) => void;
  createDisposalTask: (task: DisposalTask) => void;
  createCommentTask: (task: CommentTask) => void;
  acceptDisposalTask: (taskId: string) => void;
  acceptCommentTask: (taskId: string) => void;
  submitDisposalForReview: (payload: SubmitDisposalPayload) => void;
  submitCommentExecution: (payload: SubmitCommentPayload) => void;
  approveReview: (reviewId: string, comment: string) => void;
  rejectReview: (reviewId: string, comment: string) => void;
  updateWorkflowConfig: (workflowId: string, updates: Partial<WorkflowConfig>) => void;
  createWorkflowConfig: (workflow: WorkflowConfig) => void;
  deleteWorkflowConfig: (workflowId: string) => void;
  setDefaultWorkflowConfig: (workflowId: string, scene: WorkflowConfig['scene']) => void;
  getSentimentTaskStatusById: (sentimentId: string) => SentimentTaskStatus;
  confirmSentimentClosure: (sentimentId: string, note: string) => void;
  getClosureRecordBySentimentId: (sentimentId: string) => SentimentClosureRecord | undefined;
}

const TaskWorkflowContext = createContext<TaskWorkflowContextValue | null>(null);

export function TaskWorkflowProvider({ children }: { children: ReactNode }) {
  const { sentiments, refreshSentiments } = useSentimentData();
  const [disposalTasks, setDisposalTasks] = useState<DisposalTask[]>([]);
  const [commentTasks, setCommentTasks] = useState<CommentTask[]>([]);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [closureRecords, setClosureRecords] = useState<SentimentClosureRecord[]>([]);
  const [workflowConfigs, setWorkflowConfigs] = useState<WorkflowConfig[]>([]);

  const loadTaskWorkflow = async () => {
    try {
      const nextState = await appApi.getTaskWorkflow();
      setDisposalTasks(nextState.disposalTasks);
      setCommentTasks(nextState.commentTasks);
      setReviewRequests(nextState.reviewRequests);
      setClosureRecords(nextState.closureRecords);
      setWorkflowConfigs(nextState.workflowConfigs);
    } catch (error) {
      console.error('Failed to load task workflow', error);
    }
  };

  useEffect(() => {
    void loadTaskWorkflow();
  }, []);

  const createAssignedTask = (payload: AssignTaskPayload) => {
    void (async () => {
      try {
        await appApi.createAssignedTask(payload);
        await Promise.all([loadTaskWorkflow(), Promise.resolve(refreshSentiments())]);
      } catch (error) {
        console.error('Failed to create assigned task', error);
      }
    })();
  };

  const acceptDisposalTask = (taskId: string) => {
    void (async () => {
      try {
        await appApi.acceptDisposalTask(taskId);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to accept disposal task', error);
      }
    })();
  };

  const acceptCommentTask = (taskId: string) => {
    void (async () => {
      try {
        await appApi.acceptCommentTask(taskId);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to accept comment task', error);
      }
    })();
  };

  const submitDisposalForReview = ({ taskId, details, attachment, completedAt, workflowConfigId }: SubmitDisposalPayload) => {
    void (async () => {
      try {
        await appApi.submitDisposalForReview({ taskId, details, attachment, completedAt, workflowConfigId });
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to submit disposal review', error);
      }
    })();
  };

  const submitCommentExecution = ({ taskId, submission, submitForReview, workflowConfigId }: SubmitCommentPayload) => {
    void (async () => {
      try {
        await appApi.submitCommentExecution({ taskId, submission, submitForReview, workflowConfigId });
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to submit comment execution', error);
      }
    })();
  };

  const approveReview = (reviewId: string, comment: string) => {
    void (async () => {
      try {
        await appApi.approveReview(reviewId, comment);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to approve review', error);
      }
    })();
  };

  const rejectReview = (reviewId: string, comment: string) => {
    void (async () => {
      try {
        await appApi.rejectReview(reviewId, comment);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to reject review', error);
      }
    })();
  };

  const updateWorkflowConfig = (workflowId: string, updates: Partial<WorkflowConfig>) => {
    void (async () => {
      try {
        await appApi.updateWorkflowConfig(workflowId, updates);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to update workflow config', error);
      }
    })();
  };

  const createWorkflowConfig = (workflow: WorkflowConfig) => {
    void (async () => {
      try {
        await appApi.createWorkflowConfig(workflow);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to create workflow config', error);
      }
    })();
  };

  const deleteWorkflowConfig = (workflowId: string) => {
    void (async () => {
      try {
        await appApi.deleteWorkflowConfig(workflowId);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to delete workflow config', error);
      }
    })();
  };

  const setDefaultWorkflowConfig = (workflowId: string, scene: WorkflowConfig['scene']) => {
    void (async () => {
      try {
        await appApi.setDefaultWorkflowConfig(workflowId, scene);
        await loadTaskWorkflow();
      } catch (error) {
        console.error('Failed to set default workflow config', error);
      }
    })();
  };

  const getSentimentTaskStatusById = (sentimentId: string) => {
    const sentiment = sentiments.find((item) => item.id === sentimentId);
    if (!sentiment) {
      return '待指派' as SentimentTaskStatus;
    }
    return getSentimentTaskStatus(sentiment, disposalTasks, commentTasks);
  };

  const confirmSentimentClosure = (sentimentId: string, note: string) => {
    void (async () => {
      try {
        await appApi.confirmSentimentClosure(sentimentId, note);
        await Promise.all([loadTaskWorkflow(), Promise.resolve(refreshSentiments())]);
      } catch (error) {
        console.error('Failed to confirm sentiment closure', error);
      }
    })();
  };

  const getClosureRecordBySentimentId = (sentimentId: string) => (
    closureRecords.find((item) => item.sentimentId === sentimentId)
  );

  const value = useMemo<TaskWorkflowContextValue>(() => ({
    disposalTasks,
    commentTasks,
    reviewRequests,
    closureRecords,
    workflowConfigs,
    createAssignedTask,
    createDisposalTask: (task) => {
      void (async () => {
        try {
          await appApi.createDisposalTask(task);
          await Promise.all([loadTaskWorkflow(), Promise.resolve(refreshSentiments())]);
        } catch (error) {
          console.error('Failed to create disposal task', error);
        }
      })();
    },
    createCommentTask: (task) => {
      void (async () => {
        try {
          await appApi.createCommentTask(task);
          await Promise.all([loadTaskWorkflow(), Promise.resolve(refreshSentiments())]);
        } catch (error) {
          console.error('Failed to create comment task', error);
        }
      })();
    },
    acceptDisposalTask,
    acceptCommentTask,
    submitDisposalForReview,
    submitCommentExecution,
    approveReview,
    rejectReview,
    updateWorkflowConfig,
    createWorkflowConfig,
    deleteWorkflowConfig,
    setDefaultWorkflowConfig,
    getSentimentTaskStatusById,
    confirmSentimentClosure,
    getClosureRecordBySentimentId,
  }), [closureRecords, commentTasks, disposalTasks, refreshSentiments, reviewRequests, sentiments, workflowConfigs]);

  return (
    <TaskWorkflowContext.Provider value={value}>
      {children}
    </TaskWorkflowContext.Provider>
  );
}

export function useTaskWorkflow() {
  const context = useContext(TaskWorkflowContext);

  if (!context) {
    throw new Error('useTaskWorkflow must be used within TaskWorkflowProvider');
  }

  return context;
}
