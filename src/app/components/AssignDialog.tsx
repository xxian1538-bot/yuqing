import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { SentimentLevel } from "../types";
import { mockDisposalTasks } from "../data/mockData";
import { useSentimentData } from "../context/SentimentDataContext";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentId: string;
  sentimentLevel: SentimentLevel | string;
}

const targetGroups = [
  {
    key: "person",
    label: "人员",
    options: [
      { id: "person:zhang_chen", label: "张晨", description: "市场监管组" },
      { id: "person:li_yun", label: "李昀", description: "物流保障组" },
      { id: "person:wang_qi", label: "王琪", description: "法规宣传组" },
    ],
  },
  {
    key: "role",
    label: "角色",
    options: [
      { id: "role:spokesperson", label: "发言人", description: "统一口径回应" },
      { id: "role:commentator", label: "网评员", description: "执行舆论引导" },
      { id: "role:analyst", label: "研判专员", description: "补充分析支撑" },
    ],
  },
  {
    key: "organization",
    label: "组织",
    options: [
      { id: "organization:marketing_center", label: "营销中心", description: "市场与客户服务" },
      { id: "organization:logistics_center", label: "物流中心", description: "配送与应急保障" },
      { id: "organization:inspection_team", label: "专卖稽查支队", description: "专卖监管执行" },
    ],
  },
  {
    key: "position",
    label: "职位",
    options: [
      { id: "position:section_chief", label: "科室负责人", description: "统筹处置安排" },
      { id: "position:duty_manager", label: "值班经理", description: "跟进现场响应" },
      { id: "position:team_lead", label: "班组长", description: "组织具体执行" },
    ],
  },
];

export function AssignDialog({ open, onOpenChange, sentimentId, sentimentLevel }: AssignDialogProps) {
  const [taskType, setTaskType] = useState<'disposal' | 'comment'>('disposal');
  const { sentiments } = useSentimentData();
  
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");

  const [measures, setMeasures] = useState("");
  const [postCount, setPostCount] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [contentDirection, setContentDirection] = useState("");
  const [referenceEventIds, setReferenceEventIds] = useState<string[]>([]);

  const historicalReferences = sentiments
    .filter(sentiment => sentiment.status === '已办结' && sentiment.id !== sentimentId)
    .map(sentiment => {
      const latestDisposal = mockDisposalTasks
        .filter(task => task.sentimentId === sentiment.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        sentiment,
        result: latestDisposal?.result || latestDisposal?.progress || sentiment.analysis,
      };
    });

  const getTargetLabel = (targetId: string) => {
    for (const group of targetGroups) {
      const option = group.options.find((item) => item.id === targetId);
      if (option) {
        return `${group.label}：${option.label}${option.description ? `（${option.description}）` : ''}`;
      }
    }
    return targetId;
  };

  const handleTargetChange = (targetId: string, checked: boolean) => {
    setSelectedTargets((prev) => checked ? [...prev, targetId] : prev.filter((id) => id !== targetId));
  };

  const handleReferenceChange = (eventId: string, checked: boolean) => {
    setReferenceEventIds(prev => checked ? [...prev, eventId] : prev.filter(id => id !== eventId));
  };

  const handleSubmit = () => {
    const targetLabels = selectedTargets.map(getTargetLabel).join('\n- ');
    const referenceTitles = referenceEventIds
      .map(id => historicalReferences.find(item => item.sentiment.id === id)?.sentiment.title)
      .filter(Boolean)
      .join('\n- ');

    if (taskType === 'disposal') {
      alert(`处置任务发起成功!\n关联舆情: ${sentimentId}\n处理对象: ${targetLabels ? `\n- ${targetLabels}` : '未选择'}\n截止时间: ${deadline}\n处置措施: ${measures}\n参考案例: ${referenceTitles ? `\n- ${referenceTitles}` : '未选择'}`);
    } else {
      alert(`网评任务发起成功!\n关联舆情: ${sentimentId}\n处理对象: ${targetLabels ? `\n- ${targetLabels}` : '未选择'}\n截止时间: ${deadline}\n发帖数量: ${postCount}\n发布平台: ${platforms}\n内容方向: ${contentDirection}\n参考案例: ${referenceTitles ? `\n- ${referenceTitles}` : '未选择'}`);
    }
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setTaskType('disposal');
      setSelectedTargets([]);
      setDeadline('');
      setMeasures('');
      setPostCount('');
      setPlatforms('');
      setContentDirection('');
      setReferenceEventIds([]);
    }
  }, [open, sentimentId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[42rem] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>舆情指派</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm mb-4">
            当前舆情等级为 <strong>{sentimentLevel}</strong>，您可以发起线下处置任务或线上网评任务。
          </div>
          
          <div className="space-y-2">
            <Label>选择任务类型</Label>
            <Select value={taskType} onValueChange={(val: any) => setTaskType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="请选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disposal">处置任务 (问题解决)</SelectItem>
                <SelectItem value="comment">网评任务 (舆论引导)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>处理对象</Label>
            <div className="space-y-3 rounded-md border border-gray-200 p-3">
              {targetGroups.map((group) => (
                <div key={group.key} className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">{group.label}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {group.options.map((option) => (
                      <label key={option.id} className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                        <Checkbox
                          checked={selectedTargets.includes(option.id)}
                          onCheckedChange={(checked) => handleTargetChange(option.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">可按人员、角色、组织、职位混合选择，用于灵活下发当前任务。</p>
          </div>

          <div className="space-y-2">
            <Label>截止时间</Label>
            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          {taskType === 'disposal' && (
            <div className="space-y-2">
              <Label>处置措施与要求</Label>
              <Textarea 
                value={measures} 
                onChange={(e) => setMeasures(e.target.value)} 
                className="min-h-24"
                placeholder="请输入需要执行的具体处置动作..." 
              />
            </div>
          )}

          {taskType === 'comment' && (
            <>
              <div className="space-y-2">
                <Label>要求发帖数量</Label>
                <Input type="number" min="1" value={postCount} onChange={(e) => setPostCount(e.target.value)} placeholder="例如：10" />
              </div>
              <div className="space-y-2">
                <Label>目标发布平台</Label>
                <Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="例如：微博, 抖音, 知乎" />
              </div>
              <div className="space-y-2">
                <Label>内容导向 / 话术要求</Label>
                <Textarea 
                  value={contentDirection} 
                  onChange={(e) => setContentDirection(e.target.value)} 
                  className="min-h-24"
                  placeholder="请输入网评内容方向..." 
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>历史舆情参考案例</Label>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-2">
              {historicalReferences.length > 0 ? historicalReferences.map(({ sentiment, result }) => (
                <label
                  key={sentiment.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={referenceEventIds.includes(sentiment.id)}
                    onCheckedChange={(checked) => handleReferenceChange(sentiment.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 line-clamp-1">{sentiment.title}</span>
                      <Badge variant="outline">{sentiment.level}</Badge>
                    </div>
                    <div className="mb-1 text-xs text-gray-500">{sentiment.publishTime} · {sentiment.unit}</div>
                    <p className="line-clamp-2 text-xs leading-5 text-gray-600">{result}</p>
                  </div>
                </label>
              )) : (
                <div className="py-6 text-center text-sm text-gray-500">暂无已办结历史舆情可选</div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              选择后会和当前任务一起发送给处理人员，作为处置参考。
            </p>
          </div>

        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发任务</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
