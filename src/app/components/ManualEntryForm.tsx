import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SentimentInfo, SentimentLevel } from "../../types";
import { useScoringConfig } from "../context/ScoringConfigContext";
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
} from "../lib/sentimentScoring";

interface ManualEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<SentimentInfo>) => void;
}

export function ManualEntryForm({ open, onOpenChange, onSubmit }: ManualEntryFormProps) {
  const { weights } = useScoringConfig();
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    summary: "", // 研判建议
    publishTime: "",
    source: "", // 来源平台
    readCount: "",
    likeCount: "",
    shareCount: "",
    commentCount: "",
    collectCount: "",
    
    // 评估维度
    topic: "",
    attention: "",
    emotion: "",
    mediaSpread: "",
    format: "",
    channel: "",
    influence: ""
  });

  const [calculatedLevel, setCalculatedLevel] = useState<SentimentLevel | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const dimensionScores = {
    topic: getOptionScore(topicOptions, formData.topic),
    attention: getOptionScore(attentionOptions, formData.attention),
    emotion: getOptionScore(emotionOptions, formData.emotion),
    mediaSpread: getOptionScore(mediaSpreadOptions, formData.mediaSpread),
    format: getOptionScore(formatOptions, formData.format),
    channel: getOptionScore(channelOptions, formData.channel),
    influence: getOptionScore(influenceOptions, formData.influence),
  };

  const calculateLevel = () => {
    const { level, score } = calculateSentimentLevel(formData, weights);
    setCalculatedLevel(level);
    setCalculatedScore(score);
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      level: calculatedLevel || "轻微",
      readCount: parseInt(formData.readCount) || 0,
      likeCount: parseInt(formData.likeCount) || 0,
      shareCount: parseInt(formData.shareCount) || 0,
      commentCount: parseInt(formData.commentCount) || 0,
      collectCount: parseInt(formData.collectCount) || 0,
      score: calculatedScore || 0,
      topicCategory: formData.topic,
      attentionCategory: formData.attention,
      emotionCategory: formData.emotion,
      mediaSpreadCategory: formData.mediaSpread,
      formatCategory: formData.format,
      channelCategory: formData.channel,
      influenceCategory: formData.influence,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[112rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>手动添加舆情事件</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>事件标题</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="输入事件标题" />
              </div>
              <div className="space-y-2">
                <Label>原文链接</Label>
                <Input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="输入原文链接" />
              </div>
              <div className="space-y-2">
                <Label>来源平台</Label>
                <Select value={formData.source} onValueChange={v => setFormData({...formData, source: v})}>
                  <SelectTrigger><SelectValue placeholder="选择来源平台" /></SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>发帖时间</Label>
                <Input type="datetime-local" value={formData.publishTime} onChange={e => setFormData({...formData, publishTime: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>互动量数据</Label>
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">阅读量</Label>
                    <Input type="number" min="0" value={formData.readCount} onChange={e => setFormData({...formData, readCount: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">点赞量</Label>
                    <Input type="number" min="0" value={formData.likeCount} onChange={e => setFormData({...formData, likeCount: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">分享/转发</Label>
                    <Input type="number" min="0" value={formData.shareCount} onChange={e => setFormData({...formData, shareCount: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">评论量</Label>
                    <Input type="number" min="0" value={formData.commentCount} onChange={e => setFormData({...formData, commentCount: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">收藏量</Label>
                    <Input type="number" min="0" value={formData.collectCount} onChange={e => setFormData({...formData, collectCount: e.target.value})} placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>研判建议</Label>
                <Input value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="输入研判建议或处理意见" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-lg">评估维度 (用于计算舆情等级)</h3>
              <Button type="button" variant="outline" size="sm" onClick={calculateLevel}>
                计算等级
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>涉及话题分类 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.topic || "-"} / 加权 {getWeightedScore(dimensionScores.topic, weights.topicWeight)}
                  </span>
                </div>
                <Select value={formData.topic} onValueChange={v => setFormData({...formData, topic: v})}>
                  <SelectTrigger><SelectValue placeholder="选择话题分类" /></SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>命中关注度 (15%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.attention || "-"} / 加权 {getWeightedScore(dimensionScores.attention, weights.attentionWeight)}
                  </span>
                </div>
                <Select value={formData.attention} onValueChange={v => setFormData({...formData, attention: v})}>
                  <SelectTrigger><SelectValue placeholder="选择关注度" /></SelectTrigger>
                  <SelectContent>
                    {attentionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>态度倾向 (15%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.emotion || "-"} / 加权 {getWeightedScore(dimensionScores.emotion, weights.emotionWeight)}
                  </span>
                </div>
                <Select value={formData.emotion} onValueChange={v => setFormData({...formData, emotion: v})}>
                  <SelectTrigger><SelectValue placeholder="选择倾向" /></SelectTrigger>
                  <SelectContent>
                    {emotionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播媒体扩散度 (20%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.mediaSpread || "-"} / 加权 {getWeightedScore(dimensionScores.mediaSpread, weights.mediaWeight)}
                  </span>
                </div>
                <Select value={formData.mediaSpread} onValueChange={v => setFormData({...formData, mediaSpread: v})}>
                  <SelectTrigger><SelectValue placeholder="选择扩散度" /></SelectTrigger>
                  <SelectContent>
                    {mediaSpreadOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播形式 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.format || "-"} / 加权 {getWeightedScore(dimensionScores.format, weights.formatWeight)}
                  </span>
                </div>
                <Select value={formData.format} onValueChange={v => setFormData({...formData, format: v})}>
                  <SelectTrigger><SelectValue placeholder="选择形式" /></SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>传播渠道 (10%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.channel || "-"} / 加权 {getWeightedScore(dimensionScores.channel, weights.channelWeight)}
                  </span>
                </div>
                <Select value={formData.channel} onValueChange={v => setFormData({...formData, channel: v})}>
                  <SelectTrigger><SelectValue placeholder="选择渠道" /></SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>账号影响力 (20%)</Label>
                  <span className="text-xs text-gray-500">
                    原始分 {dimensionScores.influence || "-"} / 加权 {getWeightedScore(dimensionScores.influence, weights.influenceWeight)}
                  </span>
                </div>
                <Select value={formData.influence} onValueChange={v => setFormData({...formData, influence: v})}>
                  <SelectTrigger><SelectValue placeholder="选择影响力" /></SelectTrigger>
                  <SelectContent>
                    {influenceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {calculatedLevel && (
              <div className={`p-4 rounded-md mt-4 flex items-center justify-between ${
                calculatedLevel === "特别重大" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                calculatedLevel === "重大" ? "bg-red-100 text-red-800 border border-red-200" :
                calculatedLevel === "较大" ? "bg-orange-100 text-orange-800 border border-orange-200" :
                calculatedLevel === "一般" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                "bg-blue-100 text-blue-800 border border-blue-200"
              }`}>
                <div>
                  <span className="font-semibold">计算结果：</span>当前系统判定的舆情等级为
                  <span className="font-bold text-lg ml-2">{calculatedLevel}</span>
                </div>
                <div className="text-sm opacity-80">评分 {calculatedScore ?? 0} / 100</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">保存舆情</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
