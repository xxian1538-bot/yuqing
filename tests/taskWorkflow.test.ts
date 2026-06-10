import assert from 'node:assert/strict';
import { getSentimentTaskStatus } from '../src/app/utils/taskWorkflow';
import type { CommentTask, DisposalTask, SentimentInfo } from '../src/app/types';

const sentiment: SentimentInfo = {
  id: 'sentiment-1',
  title: '测试舆情',
  source: '测试来源',
  publishTime: '2026-06-10 10:00:00',
  content: '测试内容',
  summary: '测试摘要',
  channel: '测试渠道',
  readCount: 0,
  commentCount: 0,
  likeCount: 0,
  shareCount: 0,
  collectCount: 0,
  emotionTrend: '中性',
  level: '一般',
  status: '跟进中',
  field: '测试领域',
  unit: '测试单位',
  link: 'https://example.com',
  analysis: '测试分析',
  createdBy: '测试用户',
};

const baseDisposalTask: DisposalTask = {
  id: 'disposal-1',
  sentimentId: sentiment.id,
  sentimentTitle: sentiment.title,
  level: '一般',
  assignee: '测试人员',
  deadline: '2026-06-11 10:00:00',
  status: '已完成',
  progress: '',
  measures: '',
  evidence: [],
  result: '',
  createdAt: '2026-06-10 10:00:00',
  updatedAt: '2026-06-10 10:00:00',
};

const noCommentTasks: CommentTask[] = [];

assert.equal(
  getSentimentTaskStatus(sentiment, [baseDisposalTask], noCommentTasks),
  '待完结',
  '处置任务审核通过后状态为已完成，应视为任务侧已完成',
);

assert.equal(
  getSentimentTaskStatus(
    sentiment,
    [{ ...baseDisposalTask, status: '审核中' }],
    noCommentTasks,
  ),
  '处置中',
  '处置任务审核中时，舆情任务汇总仍应处于处理中',
);
