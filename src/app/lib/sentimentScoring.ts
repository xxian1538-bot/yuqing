import type { ScoringWeights, SentimentLevel } from '../types';

export interface ScoredOption {
  value: string;
  label: string;
  score: number;
}

export interface SentimentScoreSelections {
  topic: string;
  attention: string;
  emotion: string;
  mediaSpread: string;
  format: string;
  channel: string;
  influence: string;
}

export const sourceOptions = ['抖音', '快手', '微信公众号', '微博', '小红书', 'B站', '今日头条'] as const;

export const topicOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 针对包括但不限于生产经营管理领域、员工个人行为的一般见解及观点' },
  { value: '20', score: 20, label: '20分 - 针对包括但不限于生产经营管理领域、员工个人行为吐槽性质话题' },
  { value: '30', score: 30, label: '30分 - 针对包括但不限于行政许可、客户服务、员工招录满意度及规范性的投诉' },
  { value: '50', score: 50, label: '50分 - 针对包括但不限于控烟履约、薪酬、专卖执法等重点领域攻击性话题' },
  { value: '100', score: 100, label: '100分 - 针对包括但不限于行业体制机制等核心领域的恶意攻击' },
];

export const attentionOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 单条舆情转评赞均在10以下' },
  { value: '20', score: 20, label: '20分 - 单条舆情转评赞在10-1000之间' },
  { value: '30', score: 30, label: '30分 - 单条舆情转评赞在1000-10000之间' },
  { value: '50', score: 50, label: '50分 - 单条舆情信息转评赞1万-5万' },
  { value: '100', score: 100, label: '100分 - 单条舆情转评赞5万以上' },
];

export const emotionOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 轻微' },
  { value: '20', score: 20, label: '20分 - 一般' },
  { value: '30', score: 30, label: '30分 - 较强烈' },
  { value: '50', score: 50, label: '50分 - 强烈' },
  { value: '100', score: 100, label: '100分 - 极端' },
];

export const mediaSpreadOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 50%以下' },
  { value: '20', score: 20, label: '20分 - 50%-100%' },
  { value: '30', score: 30, label: '30分 - 100%-500%' },
  { value: '50', score: 50, label: '50分 - 500%-1000%' },
  { value: '100', score: 100, label: '100分 - 1000%以上' },
];

export const formatOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 文字' },
  { value: '20', score: 20, label: '20分 - 图文' },
  { value: '30', score: 30, label: '30分 - 音频' },
  { value: '50', score: 50, label: '50分 - 视频' },
  { value: '100', score: 100, label: '100分 - 视频+实图' },
];

export const channelOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 一般性论坛博客、微信公众号' },
  { value: '20', score: 20, label: '20分 - 网易、搜狐、百度百家等' },
  { value: '30', score: 30, label: '30分 - 微博、微信、小红书及区县级电视台、问诊平台等' },
  { value: '50', score: 50, label: '50分 - 今日头条、抖音及省级电视台、问诊平台等' },
  { value: '100', score: 100, label: '100分 - 全国性媒体及问诊平台' },
];

export const influenceOptions: ScoredOption[] = [
  { value: '10', score: 10, label: '10分 - 一般性个人账号及自媒体' },
  { value: '20', score: 20, label: '20分 - 行业门户或具有一定影响力的自媒体' },
  { value: '30', score: 30, label: '30分 - 加V账号或粉丝1000人以上' },
  { value: '50', score: 50, label: '50分 - 大V账号或粉丝3000人以上' },
  { value: '100', score: 100, label: '100分 - 粉丝5000人以上' },
];

export function getOptionScore(options: ScoredOption[], value: string) {
  return options.find((option) => option.value === value)?.score || 0;
}

export function getWeightedScore(score: number, weight: number) {
  return Number(((score / 100) * weight).toFixed(2));
}

export function calculateSentimentLevel(
  selections: SentimentScoreSelections,
  weights: ScoringWeights,
): { score: number; level: SentimentLevel } {
  const ratioScore =
    (getOptionScore(topicOptions, selections.topic) / 100) * weights.topicWeight +
    (getOptionScore(attentionOptions, selections.attention) / 100) * weights.attentionWeight +
    (getOptionScore(emotionOptions, selections.emotion) / 100) * weights.emotionWeight +
    (getOptionScore(mediaSpreadOptions, selections.mediaSpread) / 100) * weights.mediaWeight +
    (getOptionScore(formatOptions, selections.format) / 100) * weights.formatWeight +
    (getOptionScore(channelOptions, selections.channel) / 100) * weights.channelWeight +
    (getOptionScore(influenceOptions, selections.influence) / 100) * weights.influenceWeight;

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const score = totalWeight > 0 ? Math.round((ratioScore / totalWeight) * 100) : 0;

  if (score >= 85) {
    return { score, level: '特别重大' };
  }

  if (score >= 70) {
    return { score, level: '重大' };
  }

  if (score >= 50) {
    return { score, level: '较大' };
  }

  if (score >= 30) {
    return { score, level: '一般' };
  }

  return { score, level: '轻微' };
}
