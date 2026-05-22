// 舆情等级
export type SentimentLevel = '轻微' | '一般' | '较大' | '重大' | '特别重大';

// 舆情状态
export type SentimentStatus = '未处理' | '跟进中' | '已办结' | '已报送';

// 情感倾向
export type EmotionTrend = '正面' | '中性' | '负面';

export type SentimentTaskStatus = '待指派' | '处置中' | '待完结' | '已完结';
export type WorkflowScene = 'disposal' | 'comment';
export type WorkflowMode = 'any' | 'all';

export interface ScoringWeights {
  topicWeight: number;
  attentionWeight: number;
  emotionWeight: number;
  mediaWeight: number;
  formatWeight: number;
  channelWeight: number;
  influenceWeight: number;
}

// 舆情信息
export interface SentimentInfo {
  id: string;
  title: string;
  source: string;
  publishTime: string;
  content: string;
  summary: string;
  channel: string;
  readCount: number;
  commentCount: number;
  likeCount: number;
  shareCount: number;
  collectCount: number;
  emotionTrend: EmotionTrend;
  level: SentimentLevel;
  status: SentimentStatus;
  field: string;
  unit: string;
  link: string;
  analysis: string;
  createdBy: string;
  assignee?: string;
  score?: number;
  topicCategory?: string;
  attentionCategory?: string;
  emotionCategory?: string;
  mediaSpreadCategory?: string;
  formatCategory?: string;
  channelCategory?: string;
  influenceCategory?: string;
  primaryEventId?: string;
  relatedEventIds?: string[];
}

// 报送规则
export interface ReportRule {
  id: string;
  name: string;
  eventTypes: string[];
  levels: SentimentLevel[];
  fields: string[];
  keywords: string[];
  targets: string[];
  methods: ('系统消息' | '短信')[];
  frequency: string;
  enabled: boolean;
  createdAt: string;
}

// 报送记录
export interface ReportRecord {
  id: string;
  sentimentId: string;
  sentimentTitle: string;
  targets: string[];
  methods: string[];
  sentTime: string;
  status: '已接收' | '未接收' | '已查看';
}

// 预警规则
export interface AlertRule {
  id: string;
  name: string;
  level: SentimentLevel;
  conditions: ScoringWeights;
  threshold: number;
  responseTime: number;
  targets: string[];
  enabled: boolean;
  createdAt: string;
}

// 处置任务
export interface DisposalTask {
  id: string;
  sentimentId: string;
  sentimentTitle: string;
  level: SentimentLevel;
  assignee: string;
  deadline: string;
  status: '未接收' | '已接收' | '处置中' | '已完成' | '无法处置' | '已完结';
  progress: string;
  measures: string;
  evidence: string[];
  result: string;
  reviewStatus?: '待审核' | '审核通过' | '审核不通过';
  reviewComment?: string;
  reviewWorkflowId?: string;
  reviewWorkflowName?: string;
  rating?: number;
  assignmentTargets?: string[];
  referenceEventIds?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 网评任务
export interface CommentTask {
  id: string;
  sentimentId: string;
  disposalTaskId?: string;
  sentimentTitle: string;
  goal: string;
  requirements: {
    postCount: number;
    platforms: string[];
    contentDirection: string;
    deadline: string;
  };
  assignee: string;
  status: '未接收' | '已接收' | '未开始' | '进行中' | '已提交' | '已审核' | '未通过';
  submissions: {
    id: string;
    title: string;
    account: string;
    screenshot: string;
    link: string;
    content: string;
    platform: string;
    postTime: string;
    readCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    collectCount: number;
    summary: string;
  }[];
  reviewComment?: string;
  reviewWorkflowId?: string;
  reviewWorkflowName?: string;
  assignmentTargets?: string[];
  referenceEventIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  scene: WorkflowScene;
  mode: WorkflowMode;
  isDefault: boolean;
  enabled: boolean;
  steps: {
    id: string;
    name: string;
    targets: string[];
  }[];
  updatedAt: string;
}

export interface ReviewRequest {
  id: string;
  taskType: 'disposal' | 'comment';
  taskId: string;
  sentimentId: string;
  sentimentTitle: string;
  workflowConfigId: string;
  workflowConfigName: string;
  requester: string;
  summary: string;
  status: '待审核' | '审核通过' | '审核不通过';
  submittedAt: string;
  reviewer?: string;
  reviewedAt?: string;
  comment?: string;
}

export interface SentimentClosureRecord {
  sentimentId: string;
  note: string;
  confirmedBy: string;
  confirmedAt: string;
}

// 统计数据
export interface Statistics {
  totalSentiments: number;
  unhandled: number;
  inProgress: number;
  completed: number;
  byLevel: Record<SentimentLevel, number>;
  byEmotion: Record<EmotionTrend, number>;
  trendData: {
    date: string;
    count: number;
    level: SentimentLevel;
  }[];
}
