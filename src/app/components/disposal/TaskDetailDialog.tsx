import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { DisposalTask } from "../../types";
import { Badge } from "../../components/ui/badge";
import { useTaskWorkflow } from "../../context/TaskWorkflowContext";
import { useSentimentData } from "../../context/SentimentDataContext";
import { getAssignmentDisplayName, getAssignmentTargetLabels } from "../../utils/assignmentTargets";

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DisposalTask | null;
}

export function TaskDetailDialog({ open, onOpenChange, task }: TaskDetailProps) {
  const { reviewRequests } = useTaskWorkflow();
  const { sentiments } = useSentimentData();
  if (!task) return null;
  const referenceCases = sentiments.filter((item) => task.referenceEventIds?.includes(item.id));
  const reviewHistory = reviewRequests
    .filter((item) => item.taskType === 'disposal' && item.taskId === task.id)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

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
              <p className="mt-1">{getAssignmentDisplayName(task.assignmentTargets, task.assignee)}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">指派对象：</span>
              <p className="mt-1">{task.assignmentTargets?.length ? getAssignmentTargetLabels(task.assignmentTargets).join('、') : '未记录'}</p>
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
              <span className="text-gray-500 text-sm">完成时间：</span>
              <p className="mt-1">{task.completedAt || '未完成'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">最新进度：</span>
              <p className="mt-1">{task.progress || "暂无进度"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">任务执行内容：</span>
              <p className="mt-1 bg-gray-50 p-3 rounded text-sm">{task.result || task.progress || "暂无"}</p>
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
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">历史参考案例：</span>
              {referenceCases.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {referenceCases.map((item) => (
                    <div key={item.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.publishTime} · {item.unit}</div>
                      <div className="mt-2 text-gray-600">{item.analysis}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">未选择历史参考案例</p>
              )}
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">审核流轨迹：</span>
              {reviewHistory.length > 0 ? (
                <div className="mt-2 space-y-3">
                  {reviewHistory.map((item) => (
                    <div key={item.id} className="rounded border border-gray-200 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-gray-900">{item.workflowConfigName}</div>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <div className="mt-2 text-gray-600">{item.summary}</div>
                      <div className="mt-2 text-xs text-gray-500">
                        发起：{item.requester} · {item.submittedAt}
                        {item.reviewer ? ` · 审核：${item.reviewer}` : ''}
                        {item.reviewedAt ? ` · ${item.reviewedAt}` : ''}
                      </div>
                      {item.comment ? <div className="mt-2 text-xs text-gray-600">审核意见：{item.comment}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">暂无审核流记录</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
