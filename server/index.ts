import { createServer } from 'node:http';
import { URL } from 'node:url';
import { loadEnv } from './env';

loadEnv();

import { deleteMany, deleteRecord, ensureSchema, getCollectionStats, getMysqlConfig, upsertMany, upsertRecord, waitForMysql } from './db';
import { loadAppState, seedStateIfEmpty } from './state';
import { associateSentiments } from '../src/app/utils/sentimentAssociations';
import { normalizeScoringConfig } from '../src/app/data/scoringConfig';
import type {
  CommentTask,
  DisposalTask,
  ReportRecord,
  ReviewRequest,
  ScoringConfig,
  SentimentClosureRecord,
  SentimentInfo,
  SentimentStatus,
  WorkflowConfig,
  WorkflowScene,
} from '../src/app/types';

const API_HOST = process.env.API_HOST || '0.0.0.0';
const API_PORT = Number(process.env.API_PORT || process.env.PORT || 3001);
const CURRENT_USER = '舆情管理员';

function nowString() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function json(response: import('node:http').ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function notFound(response: import('node:http').ServerResponse) {
  json(response, 404, { message: 'Not found' });
}

function error(response: import('node:http').ServerResponse, reason: unknown) {
  const message = reason instanceof Error ? reason.message : 'Unknown error';
  json(response, 500, { message });
}

async function persistSentiments(sentiments: SentimentInfo[]) {
  await upsertMany('sentiments', sentiments.map((item) => ({ id: item.id, data: item })));
}

async function persistDisposalTasks(tasks: DisposalTask[]) {
  await upsertMany('disposal_tasks', tasks.map((item) => ({ id: item.id, data: item })));
}

async function persistCommentTasks(tasks: CommentTask[]) {
  await upsertMany('comment_tasks', tasks.map((item) => ({ id: item.id, data: item })));
}

async function persistReviewRequests(items: ReviewRequest[]) {
  await upsertMany('review_requests', items.map((item) => ({ id: item.id, data: item })));
}

async function persistWorkflowConfigs(items: WorkflowConfig[]) {
  await upsertMany('workflow_configs', items.map((item) => ({ id: item.id, data: item })));
}

async function persistClosureRecord(record: SentimentClosureRecord) {
  await upsertRecord('closure_records', record.sentimentId, record);
}

async function maybePromoteSentiment(sentimentId: string, nextStatus: SentimentStatus = '跟进中') {
  const state = await loadAppState();
  const target = state.sentiments.find((item) => item.id === sentimentId);
  if (!target || target.status !== '未处理') {
    return;
  }

  await upsertRecord('sentiments', target.id, { ...target, status: nextStatus });
}

async function handleGetSentiments(response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  json(response, 200, state.sentiments);
}

async function handleGetTaskWorkflow(response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  json(response, 200, {
    disposalTasks: state.disposalTasks,
    commentTasks: state.commentTasks,
    reviewRequests: state.reviewRequests,
    closureRecords: state.closureRecords,
    workflowConfigs: state.workflowConfigs,
  });
}

async function handleGetScoringConfig(response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  json(response, 200, state.scoringConfig);
}

async function handleAddSentiment(body: any, response: import('node:http').ServerResponse) {
  const sentiment = body.sentiment as SentimentInfo | undefined;
  if (!sentiment?.id) {
    return json(response, 400, { message: 'sentiment.id is required' });
  }

  await upsertRecord('sentiments', sentiment.id, {
    ...sentiment,
    createdAt: sentiment.createdAt || nowString(),
  });
  json(response, 201, { ok: true, id: sentiment.id });
}

async function handleDeleteSentiment(sentimentId: string, response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  const current = state.sentiments.find((item) => item.id === sentimentId);
  if (!current) {
    return notFound(response);
  }

  await deleteRecord('sentiments', sentimentId);
  json(response, 200, { ok: true });
}

async function handleDeleteSentiments(body: any, response: import('node:http').ServerResponse) {
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];
  if (ids.length === 0) {
    return json(response, 400, { message: 'ids is required' });
  }

  await deleteMany('sentiments', ids);
  json(response, 200, { ok: true, deleted: ids.length });
}

async function handleHealth(response: import('node:http').ServerResponse) {
  const config = getMysqlConfig();
  const counts = await getCollectionStats();

  json(response, 200, {
    ok: true,
    mysql: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    },
    storage: 'app_records',
    counts,
  });
}

async function handleUpdateSentiment(sentimentId: string, body: any, response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  const current = state.sentiments.find((item) => item.id === sentimentId);
  if (!current) {
    return notFound(response);
  }

  await upsertRecord('sentiments', sentimentId, {
    ...current,
    ...body.updates,
  });
  json(response, 200, { ok: true });
}

async function handleUpdateSentimentStatus(body: any, response: import('node:http').ServerResponse) {
  const { sentimentId, status } = body as { sentimentId: string; status: SentimentStatus };
  const state = await loadAppState();
  const current = state.sentiments.find((item) => item.id === sentimentId);
  if (!current) {
    return notFound(response);
  }

  await upsertRecord('sentiments', sentimentId, { ...current, status });
  json(response, 200, { ok: true });
}

async function handleAssociateEvents(body: any, response: import('node:http').ServerResponse) {
  const { selectedIds, primaryEventId } = body as { selectedIds: string[]; primaryEventId: string };
  const state = await loadAppState();
  const updated = associateSentiments(state.sentiments, selectedIds, primaryEventId);
  await persistSentiments(updated);
  json(response, 200, { ok: true });
}

async function handleReportSentiments(body: any, response: import('node:http').ServerResponse) {
  const { sentimentIds, target, reportNote } = body as { sentimentIds: string[]; target: string; reportNote: string };
  const state = await loadAppState();
  const sentiments = state.sentiments.map((item) => (
    sentimentIds.includes(item.id) ? { ...item, status: '已报送' as SentimentStatus } : item
  ));

  const records: ReportRecord[] = sentimentIds.map((sentimentId, index) => {
    const sentiment = state.sentiments.find((item) => item.id === sentimentId);
    return {
      id: `report-${Date.now()}-${index}`,
      sentimentId,
      sentimentTitle: sentiment?.title || sentimentId,
      targets: [target],
      methods: ['系统消息'],
      sentTime: nowString(),
      status: reportNote ? '已查看' : '已接收',
    };
  });

  await Promise.all([
    persistSentiments(sentiments),
    upsertMany('report_records', records.map((item) => ({ id: item.id, data: item }))),
  ]);

  json(response, 200, { ok: true });
}

async function handleAssignTask(body: any, response: import('node:http').ServerResponse) {
  const payload = body as {
    sentimentId: string;
    sentimentTitle: string;
    sentimentLevel: DisposalTask['level'];
    taskType: 'disposal' | 'comment' | 'notification';
    deadline: string;
    assigneeLabel: string;
    assignmentTargets: string[];
    referenceEventIds: string[];
    measures?: string;
    postCount?: number;
    platforms?: string[];
    contentDirection?: string;
  };

  if (payload.taskType === 'disposal') {
    const task: DisposalTask = {
      id: uniqueId('disposal'),
      sentimentId: payload.sentimentId,
      sentimentTitle: payload.sentimentTitle,
      level: payload.sentimentLevel,
      assignee: payload.assigneeLabel,
      deadline: payload.deadline,
      status: '未接收',
      progress: '任务已下发，等待接收',
      measures: payload.measures || '',
      evidence: [],
      result: '',
      assignmentTargets: payload.assignmentTargets,
      referenceEventIds: payload.referenceEventIds,
      createdAt: nowString(),
      updatedAt: nowString(),
    };
    await upsertRecord('disposal_tasks', task.id, task);
  } else {
    const task: CommentTask = {
      id: uniqueId(payload.taskType === 'notification' ? 'notification' : 'comment'),
      taskCategory: payload.taskType === 'notification' ? 'notification' : 'comment',
      sentimentId: payload.sentimentId,
      sentimentTitle: payload.sentimentTitle,
      goal: payload.taskType === 'notification'
        ? (payload.contentDirection || '请知悉当前舆情处置要求')
        : (payload.contentDirection || '配合当前舆情处置开展舆论引导'),
      requirements: {
        postCount: payload.taskType === 'notification' ? 0 : (payload.postCount || 1),
        platforms: payload.platforms || [],
        contentDirection: payload.contentDirection || '',
        deadline: payload.deadline,
      },
      assignee: payload.assigneeLabel,
      status: '未接收',
      submissions: [],
      assignmentTargets: payload.assignmentTargets,
      referenceEventIds: payload.referenceEventIds,
      createdAt: nowString(),
      updatedAt: nowString(),
    };
    await upsertRecord('comment_tasks', task.id, task);
  }

  await maybePromoteSentiment(payload.sentimentId);
  json(response, 200, { ok: true });
}

async function handleCreateDisposalTask(body: any, response: import('node:http').ServerResponse) {
  const task = body.task as DisposalTask;
  await upsertRecord('disposal_tasks', task.id, task);
  await maybePromoteSentiment(task.sentimentId);
  json(response, 200, { ok: true });
}

async function handleCreateCommentTask(body: any, response: import('node:http').ServerResponse) {
  const task = body.task as CommentTask;
  await upsertRecord('comment_tasks', task.id, task);
  await maybePromoteSentiment(task.sentimentId);
  json(response, 200, { ok: true });
}

async function handleAcceptDisposalTask(body: any, response: import('node:http').ServerResponse) {
  const { taskId } = body as { taskId: string };
  const state = await loadAppState();
  const tasks = state.disposalTasks.map((task) => (
    task.id === taskId
      ? { ...task, status: '已接收' as const, progress: '已接收任务，开始处置', updatedAt: nowString() }
      : task
  ));
  await persistDisposalTasks(tasks);
  json(response, 200, { ok: true });
}

async function handleAcceptCommentTask(body: any, response: import('node:http').ServerResponse) {
  const { taskId } = body as { taskId: string };
  const state = await loadAppState();
  const tasks = state.commentTasks.map((task) => (
    task.id === taskId
      ? { ...task, status: '已接收' as const, updatedAt: nowString() }
      : task
  ));
  await persistCommentTasks(tasks);
  json(response, 200, { ok: true });
}

async function handleSaveDisposalExecution(body: any, response: import('node:http').ServerResponse) {
  const { taskId, details, attachment, completedAt } = body as {
    taskId: string;
    details: string;
    attachment: string;
    completedAt: string;
  };
  const state = await loadAppState();

  const task = state.disposalTasks.find((item) => item.id === taskId);
  if (!task) {
    return notFound(response);
  }

  const tasks = state.disposalTasks.map((item) => (
    item.id === taskId
      ? {
          ...item,
          progress: details,
          result: details,
          evidence: attachment ? [attachment] : item.evidence,
          completedAt: completedAt || item.completedAt || nowString(),
          updatedAt: nowString(),
        }
      : item
  ));

  await persistDisposalTasks(tasks);

  json(response, 200, { ok: true });
}

async function handleSubmitDisposalReview(body: any, response: import('node:http').ServerResponse) {
  const { taskId, workflowConfigId, summary } = body as {
    taskId: string;
    workflowConfigId: string;
    summary?: string;
  };
  const state = await loadAppState();
  const workflow = state.workflowConfigs.find((item) => item.id === workflowConfigId);
  if (!workflow) {
    return json(response, 400, { message: '未找到审核流配置' });
  }

  const task = state.disposalTasks.find((item) => item.id === taskId);
  if (!task) {
    return notFound(response);
  }

  const review: ReviewRequest = {
    id: `review-${Date.now()}`,
    taskType: 'disposal',
    taskId: task.id,
    sentimentId: task.sentimentId,
    sentimentTitle: task.sentimentTitle,
    workflowConfigId: workflow.id,
    workflowConfigName: workflow.name,
    requester: CURRENT_USER,
    summary: summary || task.result || task.progress || '已完成任务执行，申请完结审核。',
    status: '待审核',
    submittedAt: nowString(),
  };

  const tasks = state.disposalTasks.map((item) => (
    item.id === taskId
      ? {
          ...item,
          status: '审核中' as const,
          reviewStatus: '待审核' as const,
          reviewWorkflowId: workflow.id,
          reviewWorkflowName: workflow.name,
          updatedAt: nowString(),
        }
      : item
  ));

  await Promise.all([
    persistDisposalTasks(tasks),
    upsertRecord('review_requests', review.id, review),
  ]);

  json(response, 200, { ok: true });
}

async function handleSubmitComment(body: any, response: import('node:http').ServerResponse) {
  const { taskId, submission } = body as {
    taskId: string;
    submission: CommentTask['submissions'][number];
  };

  const state = await loadAppState();
  const task = state.commentTasks.find((item) => item.id === taskId);
  if (!task) {
    return notFound(response);
  }

  const nextSubmission = {
    ...submission,
    id: submission.id || `submission-${Date.now()}`,
  };

  const tasks = state.commentTasks.map((item) => {
    if (item.id !== taskId) {
      return item;
    }

    const nextTask: CommentTask = {
      ...item,
      submissions: [...item.submissions, nextSubmission],
      updatedAt: nowString(),
    };

    nextTask.status = item.taskCategory === 'notification' ? '已完结' : '进行中';
    return nextTask;
  });

  await persistCommentTasks(tasks);
  json(response, 200, { ok: true });
}

async function handleSubmitCommentReview(body: any, response: import('node:http').ServerResponse) {
  const { taskId, workflowConfigId, summary } = body as {
    taskId: string;
    workflowConfigId: string;
    summary?: string;
  };

  const state = await loadAppState();
  const task = state.commentTasks.find((item) => item.id === taskId);
  if (!task) {
    return notFound(response);
  }

  const workflow = state.workflowConfigs.find((config) => config.id === workflowConfigId);
  if (!workflow) {
    return json(response, 400, { message: '未找到审核流配置' });
  }

  const latestSubmission = [...task.submissions].sort((a, b) => (
    new Date(b.postTime).getTime() - new Date(a.postTime).getTime()
  ))[0];

  const review: ReviewRequest = {
    id: `review-${Date.now()}`,
    taskType: 'comment',
    taskId: task.id,
    sentimentId: task.sentimentId,
    sentimentTitle: task.sentimentTitle,
    workflowConfigId: workflow.id,
    workflowConfigName: workflow.name,
    requester: CURRENT_USER,
    summary: summary || latestSubmission?.summary || latestSubmission?.content || '已提交执行材料，申请完结审核。',
    status: '待审核',
    submittedAt: nowString(),
  };

  const tasks = state.commentTasks.map((item) => (
    item.id === taskId
      ? {
          ...item,
          status: '审核中' as const,
          reviewWorkflowId: workflow.id,
          reviewWorkflowName: workflow.name,
          updatedAt: nowString(),
        }
      : item
  ));

  await Promise.all([
    persistCommentTasks(tasks),
    upsertRecord('review_requests', review.id, review),
  ]);
  json(response, 200, { ok: true });
}

async function handleApproveReview(body: any, response: import('node:http').ServerResponse) {
  const { reviewId, comment } = body as { reviewId: string; comment: string };
  const state = await loadAppState();
  const review = state.reviewRequests.find((item) => item.id === reviewId);
  if (!review) {
    return notFound(response);
  }

  const reviewRequests = state.reviewRequests.map((item) => (
    item.id === reviewId
      ? { ...item, status: '审核通过' as const, comment, reviewer: '审核员', reviewedAt: nowString() }
      : item
  ));

  await persistReviewRequests(reviewRequests);

  if (review.taskType === 'disposal') {
    const tasks = state.disposalTasks.map((item) => (
      item.id === review.taskId
        ? {
            ...item,
            status: '已完成' as const,
            reviewStatus: '审核通过' as const,
            reviewComment: comment,
            updatedAt: nowString(),
          }
        : item
    ));
    await persistDisposalTasks(tasks);
  } else {
    const tasks = state.commentTasks.map((item) => (
      item.id === review.taskId
        ? {
            ...item,
            status: '已完结' as const,
            reviewComment: comment,
            updatedAt: nowString(),
          }
        : item
    ));
    await persistCommentTasks(tasks);
  }

  json(response, 200, { ok: true });
}

async function handleRejectReview(body: any, response: import('node:http').ServerResponse) {
  const { reviewId, comment } = body as { reviewId: string; comment: string };
  const state = await loadAppState();
  const review = state.reviewRequests.find((item) => item.id === reviewId);
  if (!review) {
    return notFound(response);
  }

  const reviewRequests = state.reviewRequests.map((item) => (
    item.id === reviewId
      ? { ...item, status: '审核不通过' as const, comment, reviewer: '审核员', reviewedAt: nowString() }
      : item
  ));

  await persistReviewRequests(reviewRequests);

  if (review.taskType === 'disposal') {
    const tasks = state.disposalTasks.map((item) => (
      item.id === review.taskId
        ? {
            ...item,
            status: '处置中' as const,
            reviewStatus: '审核不通过' as const,
            reviewComment: comment,
            updatedAt: nowString(),
          }
        : item
    ));
    await persistDisposalTasks(tasks);
  } else {
    const tasks = state.commentTasks.map((item) => (
      item.id === review.taskId
        ? {
            ...item,
            status: '未通过' as const,
            reviewComment: comment,
            updatedAt: nowString(),
          }
        : item
    ));
    await persistCommentTasks(tasks);
  }

  json(response, 200, { ok: true });
}

async function handleUpdateWorkflow(workflowId: string, body: any, response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  const target = state.workflowConfigs.find((item) => item.id === workflowId);
  if (!target) {
    return notFound(response);
  }

  const nextWorkflow = { ...target, ...body.updates, updatedAt: nowString() };
  const workflows = state.workflowConfigs.map((item) => {
    if (item.id === workflowId) {
      return nextWorkflow;
    }

    if (nextWorkflow.isDefault && item.scene === nextWorkflow.scene) {
      return { ...item, isDefault: false };
    }

    return item;
  });
  await persistWorkflowConfigs(workflows);
  json(response, 200, { ok: true });
}

async function handleCreateWorkflow(body: any, response: import('node:http').ServerResponse) {
  const workflow = body.workflow as WorkflowConfig;
  const state = await loadAppState();
  const workflows = state.workflowConfigs.map((item) => (
    workflow.isDefault && item.scene === workflow.scene ? { ...item, isDefault: false } : item
  ));
  workflows.unshift({ ...workflow, updatedAt: workflow.updatedAt || nowString() });
  await persistWorkflowConfigs(workflows);
  json(response, 200, { ok: true });
}

async function handleDeleteWorkflow(workflowId: string, response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  const target = state.workflowConfigs.find((item) => item.id === workflowId);
  if (!target) {
    return notFound(response);
  }

  const next = state.workflowConfigs.filter((item) => item.id !== workflowId);
  if (target.isDefault && next.some((item) => item.scene === target.scene)) {
    const fallbackId = next.find((item) => item.scene === target.scene)?.id;
    if (fallbackId) {
      for (let index = 0; index < next.length; index += 1) {
        if (next[index].id === fallbackId) {
          next[index] = { ...next[index], isDefault: true, updatedAt: nowString() };
          break;
        }
      }
    }
  }

  await deleteRecord('workflow_configs', workflowId);
  await persistWorkflowConfigs(next);
  json(response, 200, { ok: true });
}

async function handleSetDefaultWorkflow(workflowId: string, scene: WorkflowScene, response: import('node:http').ServerResponse) {
  const state = await loadAppState();
  const workflows = state.workflowConfigs.map((item) => {
    if (item.scene !== scene) {
      return item;
    }
    if (item.id === workflowId) {
      return { ...item, isDefault: true, updatedAt: nowString() };
    }
    return { ...item, isDefault: false };
  });
  await persistWorkflowConfigs(workflows);
  json(response, 200, { ok: true });
}

async function handleConfirmClosure(body: any, response: import('node:http').ServerResponse) {
  const { sentimentId, note } = body as { sentimentId: string; note: string };
  const state = await loadAppState();
  const target = state.sentiments.find((item) => item.id === sentimentId);
  if (!target) {
    return notFound(response);
  }

  await Promise.all([
    upsertRecord('sentiments', sentimentId, { ...target, status: '已办结' as SentimentStatus }),
    persistClosureRecord({
      sentimentId,
      note,
      confirmedBy: '业务分管领导',
      confirmedAt: nowString(),
    }),
  ]);

  json(response, 200, { ok: true });
}

async function handleUpdateScoringConfig(body: any, response: import('node:http').ServerResponse) {
  const { config } = body as { config: ScoringConfig };
  const nextConfig = normalizeScoringConfig(config);
  const totalWeight = Object.values(nextConfig.weights).reduce((sum, value) => sum + value, 0);

  if (totalWeight !== 100) {
    return json(response, 400, { message: '权重总和必须等于 100%' });
  }

  if (Object.values(nextConfig.maxScores).some((value) => value <= 0)) {
    return json(response, 400, { message: '每个评分项总分必须大于 0' });
  }

  await upsertRecord('scoring_config', 'default', nextConfig);
  json(response, 200, { ok: true });
}

async function bootstrap() {
  await waitForMysql();
  await ensureSchema();
  await seedStateIfEmpty();

  const config = getMysqlConfig();
  console.log(`MySQL connected: ${config.user}@${config.host}:${config.port}/${config.database}`);
  console.log('Data table: app_records (collection + id + json data)');
  console.log(`Mock seed: ${process.env.SEED_MOCK_DATA === 'true' ? 'enabled' : 'disabled'}`);

  const server = createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,OPTIONS');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    if (!request.url) {
      return notFound(response);
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return await handleHealth(response);
      }
      if (request.method === 'GET' && url.pathname === '/api/sentiments') {
        return await handleGetSentiments(response);
      }
      if (request.method === 'GET' && url.pathname === '/api/task-workflow') {
        return await handleGetTaskWorkflow(response);
      }
      if (request.method === 'GET' && url.pathname === '/api/scoring-config') {
        return await handleGetScoringConfig(response);
      }

      const body = ['POST', 'PATCH', 'PUT'].includes(request.method || '') ? await readBody(request) : {};

      if (request.method === 'POST' && url.pathname === '/api/sentiments') {
        return await handleAddSentiment(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/sentiments/delete') {
        return await handleDeleteSentiments(body, response);
      }
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/sentiments/')) {
        const sentimentId = decodeURIComponent(url.pathname.replace('/api/sentiments/', ''));
        return await handleDeleteSentiment(sentimentId, response);
      }
      if (request.method === 'PATCH' && url.pathname.startsWith('/api/sentiments/')) {
        const sentimentId = decodeURIComponent(url.pathname.replace('/api/sentiments/', ''));
        return await handleUpdateSentiment(sentimentId, body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/sentiments/status') {
        return await handleUpdateSentimentStatus(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/sentiments/associate') {
        return await handleAssociateEvents(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/sentiments/report') {
        return await handleReportSentiments(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/sentiments/closure') {
        return await handleConfirmClosure(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/assign') {
        return await handleAssignTask(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/disposal') {
        return await handleCreateDisposalTask(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/comment') {
        return await handleCreateCommentTask(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/disposal/accept') {
        return await handleAcceptDisposalTask(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/comment/accept') {
        return await handleAcceptCommentTask(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/disposal/execute') {
        return await handleSaveDisposalExecution(body, response);
      }
      if (request.method === 'POST' && (url.pathname === '/api/tasks/disposal/complete' || url.pathname === '/api/tasks/disposal/submit-review')) {
        return await handleSubmitDisposalReview(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/comment/submit') {
        return await handleSubmitComment(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/tasks/comment/complete') {
        return await handleSubmitCommentReview(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/reviews/approve') {
        return await handleApproveReview(body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/reviews/reject') {
        return await handleRejectReview(body, response);
      }
      if (request.method === 'PATCH' && url.pathname.startsWith('/api/workflows/')) {
        const workflowId = decodeURIComponent(url.pathname.replace('/api/workflows/', ''));
        return await handleUpdateWorkflow(workflowId, body, response);
      }
      if (request.method === 'POST' && url.pathname === '/api/workflows') {
        return await handleCreateWorkflow(body, response);
      }
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/workflows/')) {
        const workflowId = decodeURIComponent(url.pathname.replace('/api/workflows/', ''));
        return await handleDeleteWorkflow(workflowId, response);
      }
      if (request.method === 'POST' && url.pathname.endsWith('/set-default')) {
        const workflowId = decodeURIComponent(url.pathname.replace('/api/workflows/', '').replace('/set-default', ''));
        return await handleSetDefaultWorkflow(workflowId, body.scene as WorkflowScene, response);
      }
      if (request.method === 'PUT' && url.pathname === '/api/scoring-config') {
        return await handleUpdateScoringConfig(body, response);
      }

      return notFound(response);
    } catch (reason) {
      return error(response, reason);
    }
  });

  server.listen(API_PORT, API_HOST, () => {
    console.log(`API server listening on http://${API_HOST}:${API_PORT}`);
  });
}

bootstrap().catch((reason) => {
  console.error('Failed to start API server');
  console.error(reason);
  process.exit(1);
});
