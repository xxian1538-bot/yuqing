import { SentimentInfo, ReportRule, ReportRecord, AlertRule, DisposalTask, CommentTask } from '../types';

export const mockSentiments: SentimentInfo[] = [
  {
    id: '1',
    title: '网民反映重庆部分卷烟零售点热门规格缺货，质疑货源投放不均衡',
    source: '微博、今日头条',
    publishTime: '2026-04-24 09:18:32',
    content: '有网民发帖称，近期在重庆中心城区多家持证零售店购买某些热门卷烟规格时连续遇到缺货，评论区出现“是不是只给大店供货”“普通小店拿不到货”等讨论。',
    summary: '重庆卷烟零售市场货源投放公平性受到关注',
    channel: '社交媒体',
    readCount: 125000,
    commentCount: 3420,
    likeCount: 8900,
    shareCount: 1200,
    collectCount: 450,
    emotionTrend: '负面',
    level: '较大',
    status: '跟进中',
    field: '市场监管',
    unit: '重庆烟草营销中心',
    link: 'https://example.com/chongqing-tobacco/1',
    analysis: '该舆情涉及货源投放公平性和零售客户获得感，建议核查相关片区投放策略、客户订单记录及异常集中反馈情况，及时发布服务解释口径。',
    createdBy: '系统',
    assignee: '市场监管组',
    score: 75
  },
  {
    id: '2',
    title: '重庆烟草开展零售客户诚信经营培训，短视频评论关注许可证办理流程',
    source: '抖音、视频号',
    publishTime: '2026-04-22 15:46:10',
    content: '重庆烟草相关培训短视频发布后，评论区集中询问烟草专卖零售许可证新办、延续、变更等流程，也有零售户建议进一步优化线上办理指引。',
    summary: '许可证办理和零售客户服务流程引发集中咨询',
    channel: '短视频平台',
    readCount: 456000,
    commentCount: 12300,
    likeCount: 23400,
    shareCount: 5600,
    collectCount: 2300,
    emotionTrend: '中性',
    level: '一般',
    status: '已办结',
    field: '客户服务',
    unit: '重庆烟草政务服务窗口',
    link: 'https://example.com/chongqing-tobacco/2',
    analysis: '舆情以业务咨询为主，建议补充线上办事指南、常见问题和窗口联系方式，提升政策触达效率。',
    createdBy: '系统',
    score: 92
  },
  {
    id: '3',
    title: '重庆山区零售户称雨季配送延迟，网友讨论烟草物流服务保障能力',
    source: '抖音、快手、微信公众号',
    publishTime: '2026-04-18 10:24:23',
    content: '有山区零售户在短视频中表示，近期强降雨后卷烟配送时间有所延后，部分门店临时断货。评论中既有对天气因素的理解，也有对配送通知及时性的建议。',
    summary: '极端天气下烟草物流配送时效受到关注',
    channel: '多媒体渠道',
    readCount: 234000,
    commentCount: 5670,
    likeCount: 12300,
    shareCount: 2890,
    collectCount: 1450,
    emotionTrend: '中性',
    level: '一般',
    status: '跟进中',
    field: '物流配送',
    unit: '重庆烟草物流中心',
    link: 'https://example.com/chongqing-tobacco/3',
    analysis: '该舆情与自然天气、配送告知和客户预期管理有关，建议公开说明应急配送安排，补充片区客户通知机制。',
    createdBy: '系统',
    assignee: '物流保障组',
    score: 88
  },
  {
    id: '4',
    title: '重庆校园周边疑似向未成年人售烟话题升温，家长呼吁加强巡查',
    source: '微博、抖音、快手',
    publishTime: '2026-04-12 19:04:15',
    content: '有家长在社交平台反映，重庆某学校周边个别店铺疑似存在向未成年人销售烟草制品情况，相关视频被转发后引发对校园周边监管的讨论。',
    summary: '校园周边未成年人保护相关舆情升温',
    channel: '社交媒体',
    readCount: 189000,
    commentCount: 4230,
    likeCount: 9870,
    shareCount: 1560,
    collectCount: 780,
    emotionTrend: '负面',
    level: '重大',
    status: '已办结',
    field: '专卖监管',
    unit: '重庆烟草专卖稽查支队',
    link: 'https://example.com/chongqing-tobacco/4',
    analysis: '该舆情涉及未成年人保护和校园周边经营秩序，敏感度较高，建议快速核查涉事区域，联动市场监管、教育等部门开展巡查并回应公众关切。',
    createdBy: '系统',
    score: 68,
    primaryEventId: '4',
    relatedEventIds: ['5', '6']
  },
  {
    id: '5',
    title: '媒体报道重庆烟草联合开展校园周边卷烟市场专项检查',
    source: '重庆本地媒体、微信公众号',
    publishTime: '2026-04-13 14:44:21',
    content: '本地媒体报道，重庆烟草专卖部门联合属地相关单位，对学校周边卷烟零售点开展专项检查，重点核验许可证、警示标识和经营行为。',
    summary: '校园周边专项检查回应前期社会关切',
    channel: '本地媒体',
    readCount: 567000,
    commentCount: 15600,
    likeCount: 34500,
    shareCount: 7800,
    collectCount: 3400,
    emotionTrend: '正面',
    level: '一般',
    status: '已办结',
    field: '专卖监管',
    unit: '重庆烟草专卖稽查支队',
    link: 'https://example.com/chongqing-tobacco/5',
    analysis: '该报道对前期负面舆情形成正向回应，可继续跟踪评论反馈，沉淀未成年人保护专项治理案例。',
    createdBy: '系统',
    score: 72,
    primaryEventId: '4',
    relatedEventIds: ['4', '6']
  },
  {
    id: '6',
    title: '网友晒重庆烟草“守护成长”宣传海报，建议增加线下举报渠道',
    source: '微信、今日头条',
    publishTime: '2026-04-14 08:36:05',
    content: '重庆烟草发布未成年人保护主题宣传海报后，部分网友建议在校园周边门店张贴更醒目的举报电话和二维码，并定期公示检查结果。',
    summary: '未成年人保护宣传延伸出举报渠道优化建议',
    channel: '新媒体',
    readCount: 123000,
    commentCount: 2340,
    likeCount: 5670,
    shareCount: 890,
    collectCount: 450,
    emotionTrend: '中性',
    level: '轻微',
    status: '已办结',
    field: '社会责任',
    unit: '重庆烟草法规宣传组',
    link: 'https://example.com/chongqing-tobacco/6',
    analysis: '公众建议具有建设性，可结合专项检查完善举报入口、宣传物料和信息公示机制。',
    createdBy: '系统',
    score: 65,
    primaryEventId: '4',
    relatedEventIds: ['4', '5']
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
    sentimentTitle: '网民反映重庆部分卷烟零售点热门规格缺货，质疑货源投放不均衡',
    targets: ['市场监管组', '营销中心负责人'],
    methods: ['系统消息', '短信'],
    sentTime: '2026-04-24 09:35:00',
    status: '已查看'
  },
  {
    id: '2',
    sentimentId: '3',
    sentimentTitle: '重庆山区零售户称雨季配送延迟，网友讨论烟草物流服务保障能力',
    targets: ['物流保障组'],
    methods: ['系统消息'],
    sentTime: '2026-04-18 10:40:00',
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
    sentimentTitle: '网民反映重庆部分卷烟零售点热门规格缺货，质疑货源投放不均衡',
    level: '较大',
    assignee: '市场监管组',
    deadline: '2026-04-26 18:00:00',
    status: '已完成',
    progress: '已完成相关片区客户订单和投放记录核查，并形成热门规格服务解释口径',
    measures: '1. 核查热门规格投放规则\n2. 对比零售客户订单数据\n3. 准备统一服务解释口径',
    evidence: ['supply-order-check.xlsx', 'customer-service-brief.pdf'],
    result: '经核查未发现人为定向投放异常，已向重点反馈门店解释货源投放规则，并建立热门规格缺货反馈台账。',
    reviewStatus: '审核通过',
    rating: 4,
    createdAt: '2026-04-24 09:45:00',
    updatedAt: '2026-04-24 15:30:00'
  },
  {
    id: '2',
    sentimentId: '3',
    sentimentTitle: '重庆山区零售户称雨季配送延迟，网友讨论烟草物流服务保障能力',
    level: '一般',
    assignee: '物流保障组',
    deadline: '2026-04-20 18:00:00',
    status: '已完成',
    progress: '已完成受影响片区配送复核，并向客户解释雨季应急配送安排',
    measures: '1. 启动雨季配送应急预案\n2. 对受影响客户逐户通知\n3. 发布配送服务提醒',
    evidence: ['delivery-route-check.jpg', 'customer-notice.pdf'],
    result: '相关客户反馈趋于平稳，评论区对天气原因和补送安排表示理解',
    reviewStatus: '审核通过',
    rating: 5,
    createdAt: '2026-04-18 10:50:00',
    updatedAt: '2026-04-20 16:30:00'
  }
];

export const mockCommentTasks: CommentTask[] = [
  {
    id: '1',
    sentimentId: '1',
    disposalTaskId: '1',
    sentimentTitle: '网民反映重庆部分卷烟零售点热门规格缺货，质疑货源投放不均衡',
    goal: '解释货源投放规则，回应零售客户公平经营关切',
    requirements: {
      postCount: 10,
      platforms: ['微博', '抖音', '今日头条'],
      contentDirection: '客观说明订货、投放和客户服务流程，避免扩大猜测',
      deadline: '2026-04-26 23:59:59'
    },
    assignee: '网评员A',
    status: '进行中',
    submissions: [
      {
        id: 'sub-1',
        title: '卷烟货源投放也需要看规则和订单节奏',
        account: '山城市场观察',
        screenshot: 'screenshot1.jpg',
        link: 'https://weibo.com/xxx',
        content: '热门规格阶段性紧张时，更需要公开透明的客户服务说明，也建议零售户通过正规渠道反馈具体订单问题。',
        platform: '微博',
        postTime: '2026-04-24 16:30:00',
        readCount: 1250,
        likeCount: 45,
        shareCount: 12,
        commentCount: 8,
        collectCount: 5,
        summary: '微博端第一波解释性评论已发，互动以询问具体规则为主。'
      }
    ],
    createdAt: '2026-04-24 16:00:00',
    updatedAt: '2026-04-24 16:30:00'
  },
  {
    id: '2',
    sentimentId: '3',
    disposalTaskId: '2',
    sentimentTitle: '重庆山区零售户称雨季配送延迟，网友讨论烟草物流服务保障能力',
    goal: '说明雨季配送保障措施，稳定山区零售客户预期',
    requirements: {
      postCount: 5,
      platforms: ['知乎', '微信公众号'],
      contentDirection: '突出极端天气客观影响、应急补送安排和客户通知机制',
      deadline: '2026-04-20 23:59:59'
    },
    assignee: '网评员B',
    status: '已审核',
    submissions: [
      {
        id: 'sub-2',
        title: '山区雨季配送，关键是提前告知和补送闭环',
        account: '物流服务观察员',
        screenshot: 'screenshot2.jpg',
        link: 'https://zhihu.com/xxx',
        content: '极端天气下物流延迟并不罕见，重要的是把受影响线路、预计到货时间和补送安排及时告知零售客户。',
        platform: '知乎',
        postTime: '2026-04-19 14:00:00',
        readCount: 5420,
        likeCount: 342,
        shareCount: 89,
        commentCount: 45,
        collectCount: 120,
        summary: '知乎回答获得较多认可，讨论焦点转向服务通知机制。'
      }
    ],
    createdAt: '2026-04-18 11:00:00',
    updatedAt: '2026-04-20 10:00:00'
  }
];
