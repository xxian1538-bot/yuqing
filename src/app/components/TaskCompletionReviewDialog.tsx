import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { WorkflowConfig } from '../types';
import { getWorkflowSummary } from '../utils/workflow';

interface TaskCompletionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  workflowConfigs: WorkflowConfig[];
  defaultSummary: string;
  onSubmit: (workflowConfigId: string, summary: string) => void;
}

export function TaskCompletionReviewDialog({
  open,
  onOpenChange,
  title,
  workflowConfigs,
  defaultSummary,
  onSubmit,
}: TaskCompletionReviewDialogProps) {
  const defaultWorkflowId = workflowConfigs.find((item) => item.isDefault)?.id || workflowConfigs[0]?.id || '';
  const [workflowConfigId, setWorkflowConfigId] = useState(defaultWorkflowId);
  const [summary, setSummary] = useState(defaultSummary);

  useEffect(() => {
    if (open) {
      setWorkflowConfigId(defaultWorkflowId);
      setSummary(defaultSummary);
    }
  }, [defaultSummary, defaultWorkflowId, open]);

  const handleSubmit = () => {
    if (!workflowConfigId) {
      alert('请选择审核流');
      return;
    }

    onSubmit(workflowConfigId, summary.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[40rem] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
          <div className="space-y-2">
            <Label>送审说明</Label>
            <Textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-24"
              placeholder="请输入本次完结送审说明"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">提交审核</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
