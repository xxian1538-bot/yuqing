import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { CommentTask } from "../../types";
import { useTaskWorkflow } from "../../context/TaskWorkflowContext";
import { useSentimentData } from "../../context/SentimentDataContext";
import { getAssignmentDisplayName, getAssignmentTargetLabels } from "../../utils/assignmentTargets";

interface CommentTaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: CommentTask | null;
}

export function CommentTaskDetailDialog({ open, onOpenChange, task }: CommentTaskDetailDialogProps) {
  const { reviewRequests } = useTaskWorkflow();
  const { sentiments } = useSentimentData();

  if (!task) return null;

  const referenceCases = sentiments.filter((item) => task.referenceEventIds?.includes(item.id));
  const reviewHistory = reviewRequests
    .filter((item) => item.taskType === 'comment' && item.taskId === task.id)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[84rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{task.taskCategory === 'notification' ? '通知任务详情' : '网评任务详情'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">舆情标题：</span>
              <p className="mt-1 font-medium">{task.sentimentTitle}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">负责人：</span>
              <p className="mt-1">{getAssignmentDisplayName(task.assignmentTargets, task.assignee)}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">任务类型：</span>
              <p className="mt-1">
                <Badge variant="outline">{task.taskCategory === 'notification' ? '通知任务' : '网评任务'}</Badge>
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">状态：</span>
              <p className="mt-1"><Badge variant="outline">{task.status}</Badge></p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">截止时间：</span>
              <p className="mt-1">{task.requirements.deadline}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">任务目标：</span>
              <p className="mt-1 rounded bg-gray-50 p-3 text-sm">{task.goal}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 text-sm">内容导向：</span>
              <p className="mt-1 rounded bg-gray-50 p-3 text-sm">{task.requirements.contentDirection || '暂无'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">目标平台：</span>
              <p className="mt-1">{task.requirements.platforms.join('、')}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">指派对象：</span>
              <p className="mt-1">{task.assignmentTargets?.length ? getAssignmentTargetLabels(task.assignmentTargets).join('、') : '未记录'}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 text-gray-500 text-sm">历史参考案例：</div>
            {referenceCases.length > 0 ? (
              <div className="space-y-2">
                {referenceCases.map((item) => (
                  <div key={item.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                    <a
                      href={`/sentiment/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 font-medium text-blue-600 hover:underline"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    </a>
                    <div className="mt-1 text-xs text-gray-500">{item.publishTime} · {item.unit}</div>
                    <div className="mt-2 text-gray-600">{item.analysis}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">未选择历史参考案例</div>
            )}
          </div>

          <div>
            <div className="mb-2 text-gray-500 text-sm">审核流轨迹：</div>
            {reviewHistory.length > 0 ? (
              <div className="space-y-3">
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
              <div className="text-sm text-gray-500">暂无审核流记录</div>
            )}
          </div>

          <div>
            <div className="mb-2 text-gray-500 text-sm">执行记录：</div>
            {task.submissions.length > 0 ? (
              <div className="space-y-2">
                {task.submissions.map((submission) => (
                  <div key={submission.id} className="rounded border border-gray-200 p-3 text-sm">
                    <div className="font-medium text-gray-900">{submission.title || submission.platform}</div>
                    <div className="mt-1 text-xs text-gray-500">{submission.account} · {submission.postTime}</div>
                    <div className="mt-2 text-gray-600">{submission.summary || submission.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">暂无执行记录</div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
