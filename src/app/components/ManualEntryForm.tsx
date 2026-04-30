import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SentimentInfo, SentimentLevel } from "../../types";
import { useScoringConfig } from "../context/ScoringConfigContext";

interface ScoredOption {
  value: string;
  label: string;
  score: number;
}

const topicOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 针对包括但不限于生产经营管理领域、员工个人行为的一般见解及观点" },
  { value: "20", score: 20, label: "20分 - 针对包括但不限于生产经营管理领域、员工个人行为吐槽性质话题" },
  { value: "30", score: 30, label: "30分 - 针对包括但不限于行政许可、客户服务、员工招录满意度及规范性的投诉" },
  { value: "50", score: 50, label: "50分 - 针对包括但不限于控烟履约、薪酬、专卖执法等重点领域攻击性话题" },
  { value: "100", score: 100, label: "100分 - 针对包括但不限于行业体制机制等核心领域的恶意攻击" },
];

const attentionOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 单条舆情转评赞均在10以下" },
  { value: "20", score: 20, label: "20分 - 单条舆情转评赞在10-1000之间" },
  { value: "30", score: 30, label: "30分 - 单条舆情转评赞在1000-10000之间" },
  { value: "50", score: 50, label: "50分 - 单条舆情信息转评赞1万-5万" },
  { value: "100", score: 100, label: "100分 - 单条舆情转评赞5万以上" },
];

const emotionOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 轻微" },
  { value: "20", score: 20, label: "20分 - 一般" },
  { value: "30", score: 30, label: "30分 - 较强烈" },
  { value: "50", score: 50, label: "50分 - 强烈" },
  { value: "100", score: 100, label: "100分 - 极端" },
];

const mediaSpreadOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 50%以下" },
  { value: "20", score: 20, label: "20分 - 50%-100%" },
  { value: "30", score: 30, label: "30分 - 100%-500%" },
  { value: "50", score: 50, label: "50分 - 500%-1000%" },
  { value: "100", score: 100, label: "100分 - 1000%以上" },
];

const formatOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 文字" },
  { value: "20", score: 20, label: "20分 - 图文" },
  { value: "30", score: 30, label: "30分 - 音频" },
  { value: "50", score: 50, label: "50分 - 视频" },
  { value: "100", score: 100, label: "100分 - 视频+实图" },
];

const channelOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 一般性论坛博客、微信公众号" },
  { value: "20", score: 20, label: "20分 - 网易、搜狐、百度百家等" },
  { value: "30", score: 30, label: "30分 - 微博、微信、小红书及区县级电视台、问诊平台等" },
  { value: "50", score: 50, label: "50分 - 今日头条、抖音及省级电视台、问诊平台等" },
  { value: "100", score: 100, label: "100分 - 全国性媒体及问诊平台" },
];

const influenceOptions: ScoredOption[] = [
  { value: "10", score: 10, label: "10分 - 一般性个人账号及自媒体" },
  { value: "20", score: 20, label: "20分 - 行业门户或具有一定影响力的自媒体" },
  { value: "30", score: 30, label: "30分 - 加V账号或粉丝1000人以上" },
  { value: "50", score: 50, label: "50分 - 大V账号或粉丝3000人以上" },
  { value: "100", score: 100, label: "100分 - 粉丝5000人以上" },
];

function getOptionScore(options: ScoredOption[], value: string) {
  return options.find((option) => option.value === value)?.score || 0;
}

function getWeightedScore(score: number, weight: number) {
  return Number(((score / 100) * weight).toFixed(2));
}

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
    const ratioScore =
      (getOptionScore(topicOptions, formData.topic) / 100) * weights.topicWeight +
      (getOptionScore(attentionOptions, formData.attention) / 100) * weights.attentionWeight +
      (getOptionScore(emotionOptions, formData.emotion) / 100) * weights.emotionWeight +
      (getOptionScore(mediaSpreadOptions, formData.mediaSpread) / 100) * weights.mediaWeight +
      (getOptionScore(formatOptions, formData.format) / 100) * weights.formatWeight +
      (getOptionScore(channelOptions, formData.channel) / 100) * weights.channelWeight +
      (getOptionScore(influenceOptions, formData.influence) / 100) * weights.influenceWeight;

    const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
    const score = totalWeight > 0 ? Math.round((ratioScore / totalWeight) * 100) : 0;

    let level: SentimentLevel = "轻微";
    if (score >= 85) level = "特别重大";
    else if (score >= 70) level = "重大";
    else if (score >= 50) level = "较大";
    else if (score >= 30) level = "一般";
    else level = "轻微";

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
      score: calculatedScore || 0
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
                    <SelectItem value="抖音">抖音</SelectItem>
                    <SelectItem value="快手">快手</SelectItem>
                    <SelectItem value="微信公众号">微信公众号</SelectItem>
                    <SelectItem value="微博">微博</SelectItem>
                    <SelectItem value="小红书">小红书</SelectItem>
                    <SelectItem value="B站">B站</SelectItem>
                    <SelectItem value="今日头条">今日头条</SelectItem>
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
