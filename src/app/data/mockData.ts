import { SentimentInfo, ReportRule, ReportRecord, AlertRule, DisposalTask, CommentTask } from '../types';

export const mockSentiments: SentimentInfo[] = [
  {
    id: '1',
    title: '改革上对做找我都汇礼，我以为是18/28/38。没想到对做说想妈88，就李到现在...',
    source: '视频号',
    publishTime: '2026-03-24 19:52:40',
    content: '改革上对做找我都汇礼，我以为是18/28/38。没想到对做说想妈88，就李到现在，我也不好意思不给，想请教一下，这种情况我该怎么办？',
    summary: '关于礼金金额的讨论引发网友热议',
    channel: '电视媒体',
    readCount: 125000,
    commentCount: 3420,
    likeCount: 8900,
    shareCount: 1200,
    collectCount: 450,
    emotionTrend: '中性',
    level: '一般',
    status: '跟进中',
    field: '新媒体',
    unit: '超普',
    link: 'https://example.com/news/1',
    analysis: '该舆情涉及民俗文化话题，关注度较高，需持续跟踪',
    createdBy: '系统',
    assignee: '张三',
    score: 75
  },
  {
    id: '2',
    title: '中方回应性侵计划访华',
    source: '抖音',
    publishTime: '2026-03-13 10:47:41',
    content: '外交部发言人就相关问题回应记者提问，表示中方欢迎各国进行正常交流访问。',
    summary: '外交部回应国际访问计划',
    channel: '新媒体平台',
    readCount: 456000,
    commentCount: 12300,
    likeCount: 23400,
    shareCount: 5600,
    collectCount: 2300,
    emotionTrend: '正面',
    level: '一般',
    status: '已办结',
    field: '新媒体',
    unit: '超普',
    link: 'https://example.com/news/2',
    analysis: '正面外交新闻，舆论导向良好',
    createdBy: '华龙网',
    score: 92
  },
  {
    id: '3',
    title: '借助AI技术，一人入司后在关村社区情绪之战，创业者费心按进口前思路妈88，真抓提成...',
    source: '抖音、快手、今日头条、微信公众号',
    publishTime: '2026-01-20 10:24:23',
    content: 'AI技术在社区服务领域的应用引发广泛关注，某创业者利用人工智能技术改善社区服务质量。',
    summary: 'AI技术助力社区服务创新',
    channel: '多媒体渠道',
    readCount: 234000,
    commentCount: 5670,
    likeCount: 12300,
    shareCount: 2890,
    collectCount: 1450,
    emotionTrend: '正面',
    level: '重大',
    status: '跟进中',
    field: '新媒体、电视',
    unit: '编辑',
    link: 'https://example.com/news/3',
    analysis: '科技创新类正面舆情，值得推广',
    createdBy: '华龙网',
    assignee: '李四',
    score: 88
  },
  {
    id: '4',
    title: '2026元旦春节',
    source: '微博、抖音、快手',
    publishTime: '2026-01-13 19:04:15',
    content: '2026年元旦春节期间各地文化活动精彩纷呈，市民参与热情高涨。',
    summary: '节日文化活动报道',
    channel: '传统媒体',
    readCount: 189000,
    commentCount: 4230,
    likeCount: 9870,
    shareCount: 1560,
    collectCount: 780,
    emotionTrend: '正面',
    level: '一般',
    status: '未处理',
    field: '新媒体、电视',
    unit: '编辑',
    link: 'https://example.com/news/4',
    analysis: '节日类常规舆情，关注度中等',
    createdBy: '系统',
    score: 68
  },
  {
    id: '5',
    title: '春节放假 假计时30天',
    source: '抖音',
    publishTime: '2026-01-08 14:44:21',
    content: '距离春节假期还有30天，各地开始准备节日相关工作安排。',
    summary: '春节假期倒计时',
    channel: '新媒体',
    readCount: 567000,
    commentCount: 15600,
    likeCount: 34500,
    shareCount: 7800,
    collectCount: 3400,
    emotionTrend: '正面',
    level: '一般',
    status: '已办结',
    field: '新媒体',
    unit: '编辑',
    link: 'https://example.com/news/5',
    analysis: '节日倒计时话题，民众关注度高',
    createdBy: '华龙网',
    score: 72
  },
  {
    id: '6',
    title: '元旦节 校假通知',
    source: '微信、今日头条',
    publishTime: '2026-01-08 14:43:10',
    content: '各地学校发布元旦节假期通知，做好假期安全教育工作。',
    summary: '学校元旦假期安排',
    channel: '新媒体',
    readCount: 123000,
    commentCount: 2340,
    likeCount: 5670,
    shareCount: 890,
    collectCount: 450,
    emotionTrend: '中性',
    level: '轻微',
    status: '已办结',
    field: '新媒体',
    unit: '编辑',
    link: 'https://example.com/news/6',
    analysis: '教育类常规信息',
    createdBy: '系统',
    score: 65
  }
];

export const mockReportRules: ReportRule[] = [
  {
    id: '1',
    name: '特别重大舆情紧急报送',
    eventTypes: ['公共安全', '社会事件'],
    levels: ['特别重大', '重大'],
    fields: ['全部'],
    keywords: ['安全', '事故', '冲突'],
    targets: ['决策层', '舆情管理员'],
    methods: ['系统消息', '短信'],
    frequency: '实时',
    enabled: true,
    createdAt: '2026-01-01 10:00:00'
  },
  {
    id: '2',
    name: '一般舆情常规报送',
    eventTypes: ['政策解读', '民生服务'],
    levels: ['一般', '较大'],
    fields: ['新媒体', '电视'],
    keywords: [],
    targets: ['业务部门负责人'],
    methods: ['系统消息'],
    frequency: '每日汇总',
    enabled: true,
    createdAt: '2026-01-05 14:30:00'
  }
];

export const mockReportRecords: ReportRecord[] = [
  {
    id: '1',
    sentimentId: '1',
    sentimentTitle: '改革上对做找我都汇礼，我以为是18/28/38...',
    targets: ['张三', '李四'],
    methods: ['系统消息', '短信'],
    sentTime: '2026-03-24 19:55:00',
    status: '已查看'
  },
  {
    id: '2',
    sentimentId: '3',
    sentimentTitle: '借助AI技术，一人入司后在关村社区情绪之战...',
    targets: ['王五'],
    methods: ['系统消息'],
    sentTime: '2026-01-20 10:30:00',
    status: '已接收'
  }
];

export const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: '特别重大舆情预警规则',
    level: '特别重大',
    conditions: {
      topicWeight: 10,
      attentionWeight: 15,
      emotionWeight: 15,
      mediaWeight: 20,
      formatWeight: 10,
      channelWeight: 10,
      influenceWeight: 20
    },
    threshold: 85,
    responseTime: 2,
    targets: ['舆情管理员', '决策层'],
    enabled: true,
    createdAt: '2026-01-01 09:00:00'
  },
  {
    id: '2',
    name: '重大舆情预警规则',
    level: '重大',
    conditions: {
      topicWeight: 10,
      attentionWeight: 15,
      emotionWeight: 15,
      mediaWeight: 20,
      formatWeight: 10,
      channelWeight: 10,
      influenceWeight: 20
    },
    threshold: 70,
    responseTime: 6,
    targets: ['舆情管理员', '业务部门负责人'],
    enabled: true,
    createdAt: '2026-01-01 09:00:00'
  },
  {
    id: '3',
    name: '一般舆情预警规则',
    level: '一般',
    conditions: {
      topicWeight: 10,
      attentionWeight: 15,
      emotionWeight: 15,
      mediaWeight: 20,
      formatWeight: 10,
      channelWeight: 10,
      influenceWeight: 20
    },
    threshold: 40,
    responseTime: 48,
    targets: ['业务部门负责人'],
    enabled: true,
    createdAt: '2026-01-01 09:00:00'
  }
];

export const mockDisposalTasks: DisposalTask[] = [
  {
    id: '1',
    sentimentId: '1',
    sentimentTitle: '改革上对做找我都汇礼，我以为是18/28/38...',
    level: '一般',
    assignee: '张三',
    deadline: '2026-03-26 19:52:40',
    status: '未接收',
    progress: '已联系相关部门，正在核实情况',
    measures: '1. 收集相关信息\n2. 联系当事人\n3. 准备回应方案',
    evidence: [],
    result: '',
    createdAt: '2026-03-24 20:00:00',
    updatedAt: '2026-03-25 10:30:00'
  },
  {
    id: '2',
    sentimentId: '3',
    sentimentTitle: '借助AI技术，一人入司后在关村社区情绪之战...',
    level: '轻微',
    assignee: '李四',
    deadline: '2026-01-22 10:24:23',
    status: '已完成',
    progress: '已完成正面宣传报道',
    measures: '1. 组织专题报道\n2. 发布官方声明\n3. 引导正面舆论',
    evidence: ['evidence1.jpg', 'evidence2.pdf'],
    result: '舆情已得到有效控制，正面评价占比90%',
    reviewStatus: '审核通过',
    rating: 5,
    createdAt: '2026-01-20 10:30:00',
    updatedAt: '2026-01-22 09:00:00'
  }
];

export const mockCommentTasks: CommentTask[] = [
  {
    id: '1',
    sentimentId: '1',
    disposalTaskId: '1',
    sentimentTitle: '改革上对做找我都汇礼，我以为是18/28/38...',
    goal: '引导舆论走向，传递正确价值观',
    requirements: {
      postCount: 10,
      platforms: ['微博', '抖音', '今日头条'],
      contentDirection: '理性讨论，传递正能量',
      deadline: '2026-03-26 23:59:59'
    },
    assignee: '网评员A',
    status: '进行中',
    submissions: [
      {
        id: 'sub-1',
        title: '关于近期礼金话题的客观分析',
        account: '理性的看客',
        screenshot: 'screenshot1.jpg',
        link: 'https://weibo.com/xxx',
        content: '理性看待这个问题，每个地方的习俗都不同...',
        platform: '微博',
        postTime: '2026-03-25 10:30:00',
        readCount: 1250,
        likeCount: 45,
        shareCount: 12,
        commentCount: 8,
        collectCount: 5,
        summary: '微博端第一波评论已发，反响较为正面。'
      }
    ],
    createdAt: '2026-03-24 20:30:00',
    updatedAt: '2026-03-25 10:30:00'
  },
  {
    id: '2',
    sentimentId: '3',
    disposalTaskId: '2',
    sentimentTitle: '借助AI技术，一人入司后在关村社区情绪之战...',
    goal: '宣传科技创新成果，引导正向舆论',
    requirements: {
      postCount: 5,
      platforms: ['知乎', '微信公众号'],
      contentDirection: '科技向善，服务民生',
      deadline: '2026-01-22 23:59:59'
    },
    assignee: '网评员B',
    status: '已审核',
    submissions: [
      {
        id: 'sub-2',
        title: '科技如何改变现代社区管理',
        account: '科技观察员',
        screenshot: 'screenshot2.jpg',
        link: 'https://zhihu.com/xxx',
        content: 'AI技术在社区服务中的应用值得点赞...',
        platform: '知乎',
        postTime: '2026-01-21 14:00:00',
        readCount: 5420,
        likeCount: 342,
        shareCount: 89,
        commentCount: 45,
        collectCount: 120,
        summary: '知乎高赞回答已上榜，有效引导了讨论方向。'
      }
    ],
    createdAt: '2026-01-20 11:00:00',
    updatedAt: '2026-01-22 10:00:00'
  }
];
