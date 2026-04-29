import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { DisposalTask } from "../../types";
import { Badge } from "../../components/ui/badge";

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DisposalTask | null;
}

export function TaskDetailDialog({ open, onOpenChange, task }: TaskDetailProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[84rem] bg-white">
        <DialogHeader>
          <DialogTitle>任务详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">舆情标题：</span>
              <p className="font-medium mt-1">{task.sentimentTitle}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">舆情等级：</span>
              <p className="mt-1"><Badge>{task.level}</Badge></p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">负责人：</span>
              <p className="mt-1">{task.assignee}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">状态：</span>
              <p className="mt-1"><Badge variant="outline">{task.status}</Badge></p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">截止时间：</span>
              <p className="mt-1">{task.deadline}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">最新进度：</span>
              <p className="mt-1">{task.progress || "暂无进度"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">处置措施：</span>
              <p className="mt-1 bg-gray-50 p-3 rounded text-sm">{task.measures || "暂无"}</p>
            </div>
            {task.evidence && task.evidence.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500 text-sm">证明材料附件：</span>
                <ul className="mt-1 list-disc pl-5 text-sm text-blue-600">
                  {task.evidence.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
