import { useEffect, useMemo, useState } from 'react';
import type { SentimentInfo, SentimentLevel } from '../types';
import { useScoringConfig } from '../context/ScoringConfigContext';
import {
  attentionOptions,
  calculateSentimentLevel,
  channelOptions,
  emotionOptions,
  formatOptions,
  getOptionScore,
  getWeightedScore,
  influenceOptions,
  mediaSpreadOptions,
  sourceOptions,
  topicOptions,
} from '../lib/sentimentScoring';
import { getDeadlineRuleText, getPresetDeadline, toDateTimeLocalValue } from '../utils/sentimentDeadline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface SentimentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentiment: SentimentInfo | null;
  onSubmit: (updates: Partial<SentimentInfo>) => void | Promise<void>;
}

export function SentimentEditDialog({ open, onOpenChange, sentiment, onSubmit }: SentimentEditDialogProps) {
  const { weights, maxScores } = useScoringConfig();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    source: '',
    deadline: '',
    analysis: '',
    link: '',
    readCount: '',
    likeCount: '',
    shareCount: '',
    commentCount: '',
    collectCount: '',
    topic: '',
    attention: '',
    emotion: '',
    mediaSpread: '',
    format: '',
    channel: '',
    influence: '',
  });
  const [calculatedLevel, setCalculatedLevel] = useState<SentimentLevel>('轻微');
  const [calculatedScore, setCalculatedScore] = useState(0);

  useEffect(() => {
    if (!sentiment) {
      return;
    }

    setFormData({
      title: sentiment.title,
      summary: sentiment.summary,
      content: sentiment.content,
      source: sentiment.source,
      deadline: toDateTimeLocalValue(sentiment.deadline || sentiment.publishTime),
      analysis: sentiment.analysis,
      link: sentiment.link,
      readCount: String(sentiment.readCount ?? 0),
      likeCount: String(sentiment.likeCount ?? 0),
      shareCount: String(sentiment.shareCount ?? 0),
      commentCount: String(sentiment.commentCount ?? 0),
      collectCount: String(sentiment.collectCount ?? 0),
      topic: sentiment.topicCategory || '',
      attention: sentiment.attentionCategory || '',
      emotion: sentiment.emotionCategory || '',
      mediaSpread: sentiment.mediaSpreadCategory || '',
      format: sentiment.formatCategory || '',
      channel: sentiment.channelCategory || '',
      influence: sentiment.influenceCategory || '',
    });
    setCalculatedLevel(sentiment.level);
    setCalculatedScore(sentiment.score || 0);
  }, [sentiment]);

  const availableSourceOptions = useMemo(() => {
    if (!formData.source || sourceOptions.includes(formData.source as (typeof sourceOptions)[number])) {
      return sourceOptions;
    }

    return [...sourceOptions, formData.source] as const;
  }, [formData.source]);

  const dimensionScores = {
    topic: getOptionScore(topicOptions, formData.topic),
    attention: getOptionScore(attentionOptions, formData.attention),
    emotion: getOptionScore(emotionOptions, formData.emotion),
    mediaSpread: getOptionScore(mediaSpreadOptions, formData.mediaSpread),
    format: getOptionScore(formatOptions, formData.format),
    channel: getOptionScore(channelOptions, formData.channel),
    influence: getOptionScore(influenceOptions, formData.influence),
  };

  const handleCalculate = () => {
    const { level, score } = calculateSentimentLevel(formData, weights, maxScores);
    setCalculatedLevel(level);
    setCalculatedScore(score);
    setFormData((current) => ({
      ...current,
      deadline: getPresetDeadline(level),
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        source: formData.source,
        deadline: formData.deadline.replace('T', ' '),
        analysis: formData.analysis,
        link: formData.link,
        readCount: parseInt(formData.readCount, 10) || 0,
        likeCount: parseInt(formData.likeCount, 10) || 0,
        shareCount: parseInt(formData.shareCount, 10) || 0,
        commentCount: parseInt(formData.commentCount, 10) || 0,
        collectCount: parseInt(formData.collectCount, 10) || 0,
        level: calculatedLevel,
        score: calculatedScore,
        topicCategory: formData.topic,
        attentionCategory: formData.attention,
        emotionCategory: formData.emotion,
        mediaSpreadCategory: formData.mediaSpread,
        formatCategory: formData.format,
        channelCategory: formData.channel,
        influenceCategory: formData.influence,
      });
      onOpenChange(false);
    } catch {
      // 保存失败时保持弹窗打开
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[112rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>编辑舆情事件</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">基本信息</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>事件标题</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="输入事件标题" />
              </div>

              <div className="space-y-2">
                <Label>原文链接</Label>
                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="输入原文链接" />
              </div>

              <div className="space-y-2">
                <Label>来源平台</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择来源平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSourceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>处理截止时间</Label>
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
                <div className="text-xs text-gray-500">{getDeadlineRuleText(calculatedLevel)}</div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>互动量数据</Label>
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">阅读量</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.readCount}
                      onChange={(e) => setFormData({ ...formData, readCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">点赞量</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.likeCount}
                      onChange={(e) => setFormData({ ...formData, likeCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">分享/转发</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.shareCount}
                      onChange={(e) => setFormData({ ...formData, shareCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">评论量</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.commentCount}
                      onChange={(e) => setFormData({ ...formData, commentCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">收藏量</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.collectCount}
                      onChange={(e) => setFormData({ ...formData, collectCount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>内容摘要</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="min-h-20"
                  placeholder="输入内容摘要"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>完整内容</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-32"
                  placeholder="输入完整内容"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>研判建议</Label>
                <Textarea
                  value={formData.analysis}
                  onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                  className="min-h-24"
                  placeholder="输入研判建议"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">评估维度 (用于计算舆情等级)</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleCalculate}>
                计算等级
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>涉及话题分类 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.topic || '-'}/{maxScores.topicMaxScore} / 加权 {getWeightedScore(dimensionScores.topic, weights.topicWeight, maxScores.topicMaxScore)}
                  </span>
                </div>
                <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择话题分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>命中关注度 (15%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.attention || '-'}/{maxScores.attentionMaxScore} / 加权 {getWeightedScore(dimensionScores.attention, weights.attentionWeight, maxScores.attentionMaxScore)}
                  </span>
                </div>
                <Select value={formData.attention} onValueChange={(value) => setFormData({ ...formData, attention: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择关注度" />
                  </SelectTrigger>
                  <SelectContent>
                    {attentionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>态度倾向 (15%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.emotion || '-'}/{maxScores.emotionMaxScore} / 加权 {getWeightedScore(dimensionScores.emotion, weights.emotionWeight, maxScores.emotionMaxScore)}
                  </span>
                </div>
                <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择倾向" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播媒体扩散度 (20%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.mediaSpread || '-'}/{maxScores.mediaMaxScore} / 加权 {getWeightedScore(dimensionScores.mediaSpread, weights.mediaWeight, maxScores.mediaMaxScore)}
                  </span>
                </div>
                <Select value={formData.mediaSpread} onValueChange={(value) => setFormData({ ...formData, mediaSpread: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择扩散度" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaSpreadOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播形式 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.format || '-'}/{maxScores.formatMaxScore} / 加权 {getWeightedScore(dimensionScores.format, weights.formatWeight, maxScores.formatMaxScore)}
                  </span>
                </div>
                <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择形式" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播渠道 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.channel || '-'}/{maxScores.channelMaxScore} / 加权 {getWeightedScore(dimensionScores.channel, weights.channelWeight, maxScores.channelMaxScore)}
                  </span>
                </div>
                <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>账号影响力 (20%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.influence || '-'}/{maxScores.influenceMaxScore} / 加权 {getWeightedScore(dimensionScores.influence, weights.influenceWeight, maxScores.influenceMaxScore)}
                  </span>
                </div>
                <Select value={formData.influence} onValueChange={(value) => setFormData({ ...formData, influence: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择影响力" />
                  </SelectTrigger>
                  <SelectContent>
                    {influenceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className={`mt-4 flex items-center justify-between rounded-md border p-4 ${
                calculatedLevel === '特别重大'
                  ? 'border-purple-200 bg-purple-100 text-purple-800'
                  : calculatedLevel === '重大'
                    ? 'border-red-200 bg-red-100 text-red-800'
                    : calculatedLevel === '较大'
                      ? 'border-orange-200 bg-orange-100 text-orange-800'
                      : calculatedLevel === '一般'
                        ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                        : 'border-blue-200 bg-blue-100 text-blue-800'
              }`}
            >
              <div>
                <span className="font-semibold">当前等级：</span>
                <span className="ml-2 text-lg font-bold">{calculatedLevel}</span>
              </div>
              <div className="text-sm opacity-80">评分 {calculatedScore} / 100</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
            保存更新
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
