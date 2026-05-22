import type { ReviewRequest, SentimentClosureRecord, WorkflowConfig } from '../types';

export const CURRENT_USER = '舆情管理员';

export const initialWorkflowConfigs: WorkflowConfig[] = [
  {
    id: 'wf-disposal-1',
    name: '处置任务标准审核流',
    scene: 'disposal',
    mode: 'any',
    isDefault: true,
    enabled: true,
    steps: [
      { id: 'wf-disposal-1-step-1', name: '一级审核', targets: ['position:section_chief'] },
      { id: 'wf-disposal-1-step-2', name: '二级审核', targets: ['role:analyst'] },
      { id: 'wf-disposal-1-step-3', name: '三级审核', targets: ['person:zhang_chen'] },
    ],
    updatedAt: '2026-04-20 09:00:00',
  },
  {
    id: 'wf-comment-1',
    name: '网评任务发布审核流',
    scene: 'comment',
    mode: 'any',
    isDefault: true,
    enabled: true,
    steps: [
      { id: 'wf-comment-1-step-1', name: '一级审核', targets: ['role:commentator'] },
      { id: 'wf-comment-1-step-2', name: '二级审核', targets: ['position:section_chief'] },
      { id: 'wf-comment-1-step-3', name: '三级审核', targets: ['person:zhou_min'] },
    ],
    updatedAt: '2026-04-20 09:00:00',
  },
];

export const initialReviewRequests: ReviewRequest[] = [
  {
    id: 'review-disposal-1',
    taskType: 'disposal',
    taskId: '1',
    sentimentId: '1',
    sentimentTitle: '网民反映重庆部分卷烟零售点热门规格缺货，质疑货源投放不均衡',
    workflowConfigId: 'wf-disposal-1',
    workflowConfigName: '处置任务标准审核流',
    requester: CURRENT_USER,
    summary: '已完成货源投放核查，提交统一解释口径及核查附件，申请审核完结。',
    status: '审核通过',
    submittedAt: '2026-04-24 15:05:00',
    reviewer: '业务部门负责人',
    reviewedAt: '2026-04-24 15:30:00',
    comment: '核查材料完整，同意完结。',
  },
  {
    id: 'review-comment-2',
    taskType: 'comment',
    taskId: '2',
    sentimentId: '3',
    sentimentTitle: '重庆山区零售户称雨季配送延迟，网友讨论烟草物流服务保障能力',
    workflowConfigId: 'wf-comment-1',
    workflowConfigName: '网评任务发布审核流',
    requester: CURRENT_USER,
    summary: '已完成既定平台发帖和互动跟踪，提交链接及截图材料，申请审核。',
    status: '审核通过',
    submittedAt: '2026-04-20 09:20:00',
    reviewer: '网评主管',
    reviewedAt: '2026-04-20 10:00:00',
    comment: '内容方向符合要求，予以通过。',
  },
];

export const initialClosureRecords: SentimentClosureRecord[] = [
  {
    sentimentId: '2',
    note: '已完成窗口服务说明和办理指引补充，舆情热度已回落。',
    confirmedBy: '业务分管领导',
    confirmedAt: '2026-04-23 10:00:00',
  },
  {
    sentimentId: '4',
    note: '专项检查和联动回应已完成，相关风险得到控制，确认办结。',
    confirmedBy: '业务分管领导',
    confirmedAt: '2026-04-15 17:30:00',
  },
];
