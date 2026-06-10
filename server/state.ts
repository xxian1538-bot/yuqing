import { mockCommentTasks, mockDisposalTasks, mockReportRecords, mockSentiments } from '../src/app/data/mockData';
import { defaultScoringConfig, normalizeScoringConfig } from '../src/app/data/scoringConfig';
import { initialClosureRecords, initialReviewRequests, initialWorkflowConfigs } from '../src/app/data/taskWorkflowSeeds';
import type {
  CommentTask,
  DisposalTask,
  ReportRecord,
  ReviewRequest,
  ScoringConfig,
  SentimentClosureRecord,
  SentimentInfo,
  WorkflowConfig,
  WorkflowScene,
} from '../src/app/types';
import { countCollection, listCollection, upsertMany, upsertRecord } from './db';

type CollectionName =
  | 'sentiments'
  | 'disposal_tasks'
  | 'comment_tasks'
  | 'review_requests'
  | 'closure_records'
  | 'workflow_configs'
  | 'report_records'
  | 'scoring_config';

export interface AppState {
  sentiments: SentimentInfo[];
  disposalTasks: DisposalTask[];
  commentTasks: CommentTask[];
  reviewRequests: ReviewRequest[];
  closureRecords: SentimentClosureRecord[];
  workflowConfigs: WorkflowConfig[];
  reportRecords: ReportRecord[];
  scoringConfig: ScoringConfig;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeWorkflowConfig(workflow: any): WorkflowConfig {
  const scene: WorkflowScene = workflow.scene || workflow.taskType || 'disposal';
  const legacyApprover = typeof workflow.approver === 'string' && workflow.approver ? workflow.approver : '';
  const legacyNodeName = typeof workflow.nodeName === 'string' && workflow.nodeName ? workflow.nodeName : '一级审核';

  const steps = Array.isArray(workflow.steps) && workflow.steps.length > 0
    ? workflow.steps.map((step: any, index: number) => ({
        id: step.id || `${workflow.id}-step-${index + 1}`,
        name: step.name || `${index + 1}级审核`,
        targets: Array.isArray(step.targets) ? step.targets : [],
      }))
    : [
        {
          id: `${workflow.id}-step-1`,
          name: legacyNodeName || '一级审核',
          targets: legacyApprover ? [legacyApprover] : [],
        },
        {
          id: `${workflow.id}-step-2`,
          name: '二级审核',
          targets: legacyApprover ? [legacyApprover] : [],
        },
        {
          id: `${workflow.id}-step-3`,
          name: '三级审核',
          targets: legacyApprover ? [legacyApprover] : [],
        },
      ];

  return {
    id: workflow.id,
    name: workflow.name,
    scene,
    mode: workflow.mode === 'all' ? 'all' : 'any',
    isDefault: Boolean(workflow.isDefault),
    enabled: workflow.enabled !== false,
    steps,
    updatedAt: workflow.updatedAt,
  };
}

function sortByDateDesc<T>(items: T[], accessor: (item: T) => string | undefined) {
  return [...items].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    return new Date(right || 0).getTime() - new Date(left || 0).getTime();
  });
}

function ensureSceneDefaults(items: WorkflowConfig[]) {
  const groupedScenes: WorkflowScene[] = ['disposal', 'comment'];
  const next = [...items];

  for (const scene of groupedScenes) {
    const sceneItems = next.filter((item) => item.scene === scene);
    if (sceneItems.length > 0 && !sceneItems.some((item) => item.isDefault)) {
      const targetId = sceneItems[0].id;
      const index = next.findIndex((item) => item.id === targetId);
      if (index >= 0) {
        next[index] = { ...next[index], isDefault: true };
      }
    }
  }

  return next;
}

export async function seedStateIfEmpty() {
  const seedMock = process.env.SEED_MOCK_DATA === 'true';

  if (seedMock) {
    const collections: Array<{ name: CollectionName; items: Array<{ id: string; data: unknown }> }> = [
      {
        name: 'sentiments',
        items: mockSentiments.map((item) => ({ id: item.id, data: clone(item) })),
      },
      {
        name: 'disposal_tasks',
        items: mockDisposalTasks.map((item) => ({ id: item.id, data: clone(item) })),
      },
      {
        name: 'comment_tasks',
        items: mockCommentTasks.map((item) => ({ id: item.id, data: clone(item) })),
      },
      {
        name: 'review_requests',
        items: initialReviewRequests.map((item) => ({ id: item.id, data: clone(item) })),
      },
      {
        name: 'closure_records',
        items: initialClosureRecords.map((item) => ({ id: item.sentimentId, data: clone(item) })),
      },
      {
        name: 'workflow_configs',
        items: initialWorkflowConfigs.map((item) => ({ id: item.id, data: clone(item) })),
      },
      {
        name: 'report_records',
        items: mockReportRecords.map((item) => ({ id: item.id, data: clone(item) })),
      },
    ];

    for (const collection of collections) {
      const count = await countCollection(collection.name);
      if (count === 0) {
        await upsertMany(collection.name, collection.items);
      }
    }
  }

  const scoringCount = await countCollection('scoring_config');
  if (scoringCount === 0) {
    await upsertRecord('scoring_config', 'default', clone(defaultScoringConfig));
  }
}

export async function loadAppState(): Promise<AppState> {
  const [
    sentiments,
    disposalTasks,
    commentTasks,
    reviewRequests,
    closureRecords,
    workflowConfigs,
    reportRecords,
    scoringRecords,
  ] = await Promise.all([
    listCollection<SentimentInfo>('sentiments'),
    listCollection<DisposalTask>('disposal_tasks'),
    listCollection<CommentTask>('comment_tasks'),
    listCollection<ReviewRequest>('review_requests'),
    listCollection<SentimentClosureRecord>('closure_records'),
    listCollection<WorkflowConfig>('workflow_configs'),
    listCollection<ReportRecord>('report_records'),
    listCollection<ScoringConfig>('scoring_config'),
  ]);

  return {
    sentiments: sortByDateDesc(sentiments, (item) => item.publishTime),
    disposalTasks: sortByDateDesc(disposalTasks, (item) => item.createdAt),
    commentTasks: sortByDateDesc(commentTasks, (item) => item.createdAt),
    reviewRequests: sortByDateDesc(reviewRequests, (item) => item.submittedAt),
    closureRecords: sortByDateDesc(closureRecords, (item) => item.confirmedAt),
    workflowConfigs: ensureSceneDefaults(sortByDateDesc(workflowConfigs.map(normalizeWorkflowConfig), (item) => item.updatedAt)),
    reportRecords: sortByDateDesc(reportRecords, (item) => item.sentTime),
    scoringConfig: normalizeScoringConfig(scoringRecords[0] || clone(defaultScoringConfig)),
  };
}
