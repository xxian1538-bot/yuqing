import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { CommentTask } from "../../types";

interface ExecuteCommentTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: CommentTask | null;
  onSubmit: (taskId: string, submission: any) => void;
}

export function ExecuteCommentTaskDialog({ open, onOpenChange, task, onSubmit }: ExecuteCommentTaskDialogProps) {
  const [formData, setFormData] = useState({
    platform: "",
    account: "",
    title: "",
    link: "",
    content: "",
    readCount: "0",
    likeCount: "0",
    shareCount: "0",
    commentCount: "0",
    collectCount: "0",
    summary: "",
  });

  const handleSubmit = () => {
    if (!task) return;
    
    if (!formData.platform || !formData.account || !formData.link) {
      alert("请填写必填项（平台、账号、链接）");
      return;
    }

    const submission = {
      id: `sub-${Date.now()}`,
      ...formData,
      readCount: parseInt(formData.readCount) || 0,
      likeCount: parseInt(formData.likeCount) || 0,
      shareCount: parseInt(formData.shareCount) || 0,
      commentCount: parseInt(formData.commentCount) || 0,
      collectCount: parseInt(formData.collectCount) || 0,
      screenshot: 'uploaded_screenshot.jpg',
      postTime: new Date().toLocaleString()
    };

    onSubmit(task.id, submission);
    onOpenChange(false);
    
    // Reset
    setFormData({
      platform: "",
      account: "",
      title: "",
      link: "",
      content: "",
      readCount: "0",
      likeCount: "0",
      shareCount: "0",
      commentCount: "0",
      collectCount: "0",
      summary: "",
    });
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>执行网评任务：{task.sentimentTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-red-500">* <span className="text-gray-700">发帖平台</span></Label>
              <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                <SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
                <SelectContent>
                  {task.requirements.platforms.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">* <span className="text-gray-700">发帖账号</span></Label>
              <Input 
                value={formData.account} 
                onChange={e => setFormData({...formData, account: e.target.value})} 
                placeholder="发帖使用的社交媒体账号" 
              />
            </div>

            <div className="space-y-2">
              <Label>发帖标题</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="（选填）" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">* <span className="text-gray-700">发帖/评论链接</span></Label>
              <Input 
                value={formData.link} 
                onChange={e => setFormData({...formData, link: e.target.value})} 
                placeholder="请输入原文链接" 
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>互动量数据 (选填)</Label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <Label className="text-xs text-gray-500">阅读量</Label>
                <Input type="number" min="0" value={formData.readCount} onChange={e => setFormData({...formData, readCount: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">点赞量</Label>
                <Input type="number" min="0" value={formData.likeCount} onChange={e => setFormData({...formData, likeCount: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">分享/转发</Label>
                <Input type="number" min="0" value={formData.shareCount} onChange={e => setFormData({...formData, shareCount: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">评论量</Label>
                <Input type="number" min="0" value={formData.commentCount} onChange={e => setFormData({...formData, commentCount: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">收藏量</Label>
                <Input type="number" min="0" value={formData.collectCount} onChange={e => setFormData({...formData, collectCount: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>发帖截图/证明附件</Label>
            <Input type="file" />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>发帖内容 / 评论原文</Label>
            <textarea 
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="请输入您发出的实际文字内容"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label>本次执行小结</Label>
            <Input 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})} 
              placeholder="例如：阅读量已起量，评论区开始转向..." 
            />
          </div>

        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
          <div className="text-sm text-gray-600">
            当前任务已完成进度：<span className="font-bold text-blue-600">{task.submissions.length}</span> / {task.requirements.postCount}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              提交执行记录
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
