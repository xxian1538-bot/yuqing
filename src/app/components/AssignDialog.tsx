import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { SentimentLevel } from "../types";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentId: string;
  sentimentLevel: SentimentLevel | string;
}

export function AssignDialog({ open, onOpenChange, sentimentId, sentimentLevel }: AssignDialogProps) {
  const [taskType, setTaskType] = useState<'disposal' | 'comment'>('disposal');
  
  // Common Fields
  const [assignee, setAssignee] = useState("");
  const [deadline, setDeadline] = useState("");

  // Disposal specific fields
  const [measures, setMeasures] = useState("");

  // Comment specific fields
  const [postCount, setPostCount] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [contentDirection, setContentDirection] = useState("");

  const handleSubmit = () => {
    if (taskType === 'disposal') {
      alert(`处置任务发起成功!\n关联舆情: ${sentimentId}\n负责人: ${assignee}\n截止时间: ${deadline}\n处置措施: ${measures}`);
    } else {
      alert(`网评任务发起成功!\n关联舆情: ${sentimentId}\n网评员: ${assignee}\n截止时间: ${deadline}\n发帖数量: ${postCount}\n发布平台: ${platforms}\n内容方向: ${contentDirection}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label>处理人员 / 团队</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="请选择人员" />
              </SelectTrigger>
              <SelectContent>
                {taskType === 'disposal' ? (
                  <>
                    <SelectItem value="dept1_manager">张三 (新闻中心)</SelectItem>
                    <SelectItem value="dept2_manager">李四 (公关部)</SelectItem>
                    <SelectItem value="dept3_manager">王五 (法务部)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="commenterA">网评员A</SelectItem>
                    <SelectItem value="commenterB">网评员B</SelectItem>
                    <SelectItem value="comment_team_1">网评一组</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>截止时间</Label>
            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          {taskType === 'disposal' && (
            <div className="space-y-2">
              <Label>处置措施与要求</Label>
              <textarea 
                value={measures} 
                onChange={(e) => setMeasures(e.target.value)} 
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
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
                <textarea 
                  value={contentDirection} 
                  onChange={(e) => setContentDirection(e.target.value)} 
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  placeholder="请输入网评内容方向..." 
                />
              </div>
            </>
          )}

        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确认下发任务</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
