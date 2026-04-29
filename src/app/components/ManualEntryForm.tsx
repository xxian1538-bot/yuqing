import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SentimentInfo, SentimentLevel } from "../../types";
import { useScoringConfig } from "../context/ScoringConfigContext";

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
    readCount: "", // 互动量 - 阅读数
    
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

  const calculateLevel = () => {
    const ratioScore =
      (formData.topic === "敏感" ? 1 : formData.topic === "普通" ? 0.5 : 0) * weights.topicWeight +
      (formData.attention === "高" ? 1 : formData.attention === "中" ? 8 / 15 : formData.attention === "低" ? 3 / 15 : 0) * weights.attentionWeight +
      ({ "轻微": 3 / 15, "一般": 6 / 15, "较大": 10 / 15, "重大": 13 / 15, "特别重大": 1 }[formData.emotion as keyof Record<string, number>] || 0) * weights.emotionWeight +
      ({ "50%以下": 4 / 20, "50%-100%": 8 / 20, "100%-500%": 12 / 20, "500-1000%": 16 / 20, "1000%以上": 1 }[formData.mediaSpread as keyof Record<string, number>] || 0) * weights.mediaWeight +
      ({ "文字": 2 / 10, "图文": 4 / 10, "音频": 6 / 10, "视频": 8 / 10, "视频+实图": 1 }[formData.format as keyof Record<string, number>] || 0) * weights.formatWeight +
      ({ "权威媒体": 1, "自媒体": 0.6, "论坛": 0.3 }[formData.channel as keyof Record<string, number>] || 0) * weights.channelWeight +
      ({
        "个人账号及自媒体": 4 / 20,
        "行业门户或有一定影响力的自媒体": 8 / 20,
        "加V账号或粉丝1000以上": 12 / 20,
        "大V账号或粉丝3000以上": 16 / 20,
        "粉丝5000以上": 1,
      }[formData.influence as keyof Record<string, number>] || 0) * weights.influenceWeight;

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
              <div className="space-y-2">
                <Label>互动量 (阅读数/点赞数等)</Label>
                <Input type="number" value={formData.readCount} onChange={e => setFormData({...formData, readCount: e.target.value})} placeholder="输入数量" />
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
                <Label>涉及话题分类 (10%)</Label>
                <Select value={formData.topic} onValueChange={v => setFormData({...formData, topic: v})}>
                  <SelectTrigger><SelectValue placeholder="选择话题分类" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="敏感">敏感话题</SelectItem>
                    <SelectItem value="普通">普通话题</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>命中关注度 (15%)</Label>
                <Select value={formData.attention} onValueChange={v => setFormData({...formData, attention: v})}>
                  <SelectTrigger><SelectValue placeholder="选择关注度" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>态度倾向 (15%)</Label>
                <Select value={formData.emotion} onValueChange={v => setFormData({...formData, emotion: v})}>
                  <SelectTrigger><SelectValue placeholder="选择倾向" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="轻微">轻微</SelectItem>
                    <SelectItem value="一般">一般</SelectItem>
                    <SelectItem value="较大">较大</SelectItem>
                    <SelectItem value="重大">重大</SelectItem>
                    <SelectItem value="特别重大">特别重大</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>传播媒体扩散度 (20%)</Label>
                <Select value={formData.mediaSpread} onValueChange={v => setFormData({...formData, mediaSpread: v})}>
                  <SelectTrigger><SelectValue placeholder="选择扩散度" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50%以下">50%以下</SelectItem>
                    <SelectItem value="50%-100%">50%-100%</SelectItem>
                    <SelectItem value="100%-500%">100%-500%</SelectItem>
                    <SelectItem value="500-1000%">500-1000%</SelectItem>
                    <SelectItem value="1000%以上">1000%以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>传播形式 (10%)</Label>
                <Select value={formData.format} onValueChange={v => setFormData({...formData, format: v})}>
                  <SelectTrigger><SelectValue placeholder="选择形式" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="文字">文字</SelectItem>
                    <SelectItem value="图文">图文</SelectItem>
                    <SelectItem value="音频">音频</SelectItem>
                    <SelectItem value="视频">视频</SelectItem>
                    <SelectItem value="视频+实图">视频+实图</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>传播渠道 (10%)</Label>
                <Select value={formData.channel} onValueChange={v => setFormData({...formData, channel: v})}>
                  <SelectTrigger><SelectValue placeholder="选择渠道" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="权威媒体">权威媒体</SelectItem>
                    <SelectItem value="自媒体">自媒体</SelectItem>
                    <SelectItem value="论坛">论坛/社区</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>账号影响力 (20%)</Label>
                <Select value={formData.influence} onValueChange={v => setFormData({...formData, influence: v})}>
                  <SelectTrigger><SelectValue placeholder="选择影响力" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="个人账号及自媒体">个人账号及自媒体</SelectItem>
                    <SelectItem value="行业门户或有一定影响力的自媒体">行业门户或有一定影响力的自媒体</SelectItem>
                    <SelectItem value="加V账号或粉丝1000以上">加V账号或粉丝1000以上</SelectItem>
                    <SelectItem value="大V账号或粉丝3000以上">大V账号或粉丝3000以上</SelectItem>
                    <SelectItem value="粉丝5000以上">粉丝5000以上</SelectItem>
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
