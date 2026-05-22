import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import type { CommentTask } from "../../types";
import { TargetOptionGroup, TargetPickerDialog } from "../TargetPickerDialog";
import { assignmentTargetGroups, getAssignmentTargetLabel } from "../../utils/assignmentTargets";
import { ReferenceCasePickerDialog } from "../ReferenceCasePickerDialog";
import { SentimentPickerDialog } from "../SentimentPickerDialog";
import { useSentimentData } from "../../context/SentimentDataContext";
import { useTaskWorkflow } from "../../context/TaskWorkflowContext";

interface CreateCommentTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: CommentTask) => void;
}

const PLATFORM_OPTIONS = ["微博", "抖音", "快手", "小红书", "今日头条", "知乎", "微信公众号", "B站"];

export function CreateCommentTask({ open, onOpenChange, onSubmit }: CreateCommentTaskProps) {
  const [isSentimentPickerOpen, setIsSentimentPickerOpen] = useState(false);
  const [isTargetPickerOpen, setIsTargetPickerOpen] = useState(false);
  const [isReferencePickerOpen, setIsReferencePickerOpen] = useState(false);
  const [selectedSentimentId, setSelectedSentimentId] = useState<string>('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [referenceEventIds, setReferenceEventIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    goal: "",
    postCount: 10,
    platforms: [] as string[],
    contentDirection: "",
    deadline: ""
  });
  const { sentiments } = useSentimentData();
  const { disposalTasks } = useTaskWorkflow();

  const targetGroups: TargetOptionGroup[] = assignmentTargetGroups.map((group) => ({
    key: group.key,
    label: group.label,
    options: [...group.options],
  }));

  const selectedTargetLabels = useMemo(
    () => selectedTargets.map(getAssignmentTargetLabel),
    [selectedTargets],
  );
  const selectedSentiment = sentiments.find((item) => item.id === selectedSentimentId);
  const historicalReferences = sentiments
    .filter((sentiment) => sentiment.status === '已办结' && sentiment.id !== selectedSentimentId)
    .map((sentiment) => {
      const latestDisposal = disposalTasks
        .filter((task) => task.sentimentId === sentiment.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        sentiment,
        result: latestDisposal?.result || latestDisposal?.progress || sentiment.analysis,
      };
    });
  const selectedReferenceItems = useMemo(
    () => historicalReferences.filter(({ sentiment }) => referenceEventIds.includes(sentiment.id)),
    [historicalReferences, referenceEventIds],
  );

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = () => {
    if (!selectedSentiment || selectedTargets.length === 0 || !formData.deadline || formData.platforms.length === 0) {
      alert("请填写必填项（关联舆情、指派网评员、目标平台、截止时间）");
      return;
    }

    const newTask: CommentTask = {
      id: String(Date.now()),
      sentimentId: selectedSentiment.id,
      sentimentTitle: selectedSentiment.title,
      goal: formData.goal || "引导正向舆论",
      requirements: {
        postCount: Number(formData.postCount) || 1,
        platforms: formData.platforms,
        contentDirection: formData.contentDirection,
        deadline: formData.deadline.replace('T', ' '),
      },
      assignee: selectedTargetLabels.join('、'),
      status: '未接收',
      submissions: [],
      assignmentTargets: selectedTargets,
      referenceEventIds,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    onSubmit(newTask);
    onOpenChange(false);
    
    // Reset
    setFormData({
      goal: "",
      postCount: 10,
      platforms: [],
      contentDirection: "",
      deadline: ""
    });
    setSelectedSentimentId('');
    setSelectedTargets([]);
    setReferenceEventIds([]);
  };

  useEffect(() => {
    if (!open) {
      setSelectedTargets([]);
      setReferenceEventIds([]);
      setFormData({
        goal: "",
        postCount: 10,
        platforms: [],
        contentDirection: "",
        deadline: ""
      });
      setSelectedSentimentId('');
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[84rem] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>发起网评任务</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-red-500">* <span className="text-gray-700">关联舆情</span></Label>
                <Button variant="outline" size="sm" onClick={() => setIsSentimentPickerOpen(true)}>
                  选择关联舆情
                </Button>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                {selectedSentiment ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{selectedSentiment.title}</span>
                      <Badge variant="outline">{selectedSentiment.level}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedSentiment.publishTime} · {selectedSentiment.unit}
                    </div>
                    <div className="text-sm text-gray-600">{selectedSentiment.summary}</div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">尚未选择关联舆情</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>任务目标</Label>
              <Input 
                value={formData.goal} 
                onChange={e => setFormData({...formData, goal: e.target.value})} 
                placeholder="例如：对冲负面言论，传播官方澄清通报" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-red-500">* <span className="text-gray-700">指派网评员/团队</span></Label>
                  <Button variant="outline" size="sm" onClick={() => setIsTargetPickerOpen(true)}>
                    选择处理对象
                  </Button>
                </div>
                <div className="flex min-h-14 flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                  {selectedTargetLabels.length > 0 ? selectedTargetLabels.map((label) => (
                    <Badge key={label} variant="outline" className="bg-white">{label}</Badge>
                  )) : (
                    <span className="text-sm text-gray-500">尚未选择处理对象</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-red-500">* <span className="text-gray-700">要求发帖数</span></Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={formData.postCount} 
                  onChange={e => setFormData({...formData, postCount: parseInt(e.target.value) || 0})} 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-red-500">* <span className="text-gray-700">截止时间</span></Label>
                <Input 
                  type="datetime-local" 
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-red-500">* <span className="text-gray-700">目标平台 (多选)</span></Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
                {PLATFORM_OPTIONS.map(platform => {
                  const isSelected = formData.platforms.includes(platform);
                  return (
                    <Badge 
                      key={platform} 
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white hover:bg-gray-100'}`}
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>内容导向 / 话术要求</Label>
              <textarea 
                value={formData.contentDirection}
                onChange={e => setFormData({...formData, contentDirection: e.target.value})}
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                placeholder="请输入具体的话术方向，例如：强调官方正在积极处理，呼吁大家不信谣不传谣..."
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between gap-3">
                <Label>历史参考案例</Label>
                <Button variant="outline" size="sm" onClick={() => setIsReferencePickerOpen(true)}>
                  选择参考案例
                </Button>
              </div>
              <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                {selectedReferenceItems.length > 0 ? selectedReferenceItems.map(({ sentiment }) => (
                  <div key={sentiment.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                    <div className="min-w-0 text-sm text-gray-700">{sentiment.title}</div>
                    <Badge variant="outline">{sentiment.level}</Badge>
                  </div>
                )) : (
                  <span className="text-sm text-gray-500">尚未选择历史参考案例</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发任务</Button>
          </div>
        </DialogContent>
      </Dialog>

      <SentimentPickerDialog
        open={isSentimentPickerOpen}
        onOpenChange={setIsSentimentPickerOpen}
        sentiments={sentiments}
        selectedId={selectedSentimentId}
        onConfirm={(sentiment) => setSelectedSentimentId(sentiment?.id || '')}
      />

      <TargetPickerDialog
        open={isTargetPickerOpen}
        onOpenChange={setIsTargetPickerOpen}
        groups={targetGroups}
        selectedTargets={selectedTargets}
        onConfirm={setSelectedTargets}
      />

      <ReferenceCasePickerDialog
        open={isReferencePickerOpen}
        onOpenChange={setIsReferencePickerOpen}
        cases={historicalReferences}
        selectedIds={referenceEventIds}
        onConfirm={setReferenceEventIds}
      />
    </>
  );
}
