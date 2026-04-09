import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import type { CommentTask } from "../../types";

interface CreateCommentTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: CommentTask) => void;
}

const PLATFORM_OPTIONS = ["微博", "抖音", "快手", "小红书", "今日头条", "知乎", "微信公众号", "B站"];

export function CreateCommentTask({ open, onOpenChange, onSubmit }: CreateCommentTaskProps) {
  const [formData, setFormData] = useState({
    sentimentTitle: "",
    goal: "",
    assignee: "",
    postCount: 10,
    platforms: [] as string[],
    contentDirection: "",
    deadline: ""
  });

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = () => {
    if (!formData.sentimentTitle || !formData.assignee || !formData.deadline || formData.platforms.length === 0) {
      alert("请填写必填项（关联舆情、指派网评员、目标平台、截止时间）");
      return;
    }

    const newTask: CommentTask = {
      id: String(Date.now()),
      sentimentId: `S-${Date.now()}`,
      sentimentTitle: formData.sentimentTitle,
      goal: formData.goal || "引导正向舆论",
      requirements: {
        postCount: Number(formData.postCount) || 1,
        platforms: formData.platforms,
        contentDirection: formData.contentDirection,
        deadline: formData.deadline.replace('T', ' '),
      },
      assignee: formData.assignee,
      status: '未开始',
      submissions: [],
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    onSubmit(newTask);
    onOpenChange(false);
    
    // Reset
    setFormData({
      sentimentTitle: "",
      goal: "",
      assignee: "",
      postCount: 10,
      platforms: [],
      contentDirection: "",
      deadline: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>发起网评任务</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-red-500">* <span className="text-gray-700">关联舆情标题</span></Label>
            <Input 
              value={formData.sentimentTitle} 
              onChange={e => setFormData({...formData, sentimentTitle: e.target.value})} 
              placeholder="搜索或输入需要引导的舆情事件标题" 
            />
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
              <Label className="text-red-500">* <span className="text-gray-700">指派网评员/团队</span></Label>
              <Input 
                value={formData.assignee} 
                onChange={e => setFormData({...formData, assignee: e.target.value})} 
                placeholder="例如：网评员A" 
              />
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
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发任务</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
