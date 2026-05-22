import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../ui/textarea";
import { DisposalTask, WorkflowConfig } from "../../types";
import { getWorkflowSummary } from '../../utils/workflow';

interface HandleDisposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DisposalTask | null;
  workflowConfigs: WorkflowConfig[];
  onSubmit: (details: string, attachment: string, completedAt: string, workflowConfigId: string) => void;
}

export function HandleDisposalDialog({ open, onOpenChange, task, workflowConfigs, onSubmit }: HandleDisposalProps) {
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const defaultWorkflowId = workflowConfigs.find((item) => item.isDefault)?.id || workflowConfigs[0]?.id || '';
  const [workflowConfigId, setWorkflowConfigId] = useState(defaultWorkflowId);

  useEffect(() => {
    if (open) {
      setDetails(task?.result || task?.progress || '');
      setAttachment('');
      setCompletedAt(task?.completedAt?.replace(' ', 'T') || '');
      setWorkflowConfigId(defaultWorkflowId);
    }
  }, [defaultWorkflowId, open, task]);

  const handleSubmit = () => {
    if (!workflowConfigId) {
      alert('请选择审核流');
      return;
    }
    if (!details.trim()) {
      alert('请输入任务执行内容');
      return;
    }
    if (!completedAt) {
      alert('请选择完成时间');
      return;
    }
    onSubmit(details, attachment, completedAt.replace('T', ' '), workflowConfigId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[56rem] bg-white">
        <DialogHeader>
          <DialogTitle>执行处置任务</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>任务执行内容</Label>
            <Textarea 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              className="min-h-28"
              placeholder="请输入本次任务执行情况、处置结果和关键内容..." 
            />
          </div>
          <div className="space-y-2">
            <Label>完成时间</Label>
            <Input
              type="datetime-local"
              value={completedAt}
              onChange={e => setCompletedAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>附件上传 (图片/视频/文档)</Label>
            <Input 
              type="file" 
              onChange={e => setAttachment("已上传文件")} 
            />
            {attachment && <p className="text-xs text-green-600 mt-1">{attachment}</p>}
          </div>
          <div className="space-y-2">
            <Label>审核流</Label>
            <Select value={workflowConfigId} onValueChange={setWorkflowConfigId}>
              <SelectTrigger>
                <SelectValue placeholder="请选择审核流" />
              </SelectTrigger>
              <SelectContent>
                {workflowConfigs.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {getWorkflowSummary(workflow)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">保存并提交审核</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
