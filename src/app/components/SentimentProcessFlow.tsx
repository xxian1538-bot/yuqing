import { AlertCircle, Bell, Calendar, ClipboardList, MessageSquare, User } from 'lucide-react';
import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { getAssignmentDisplayName } from '../utils/assignmentTargets';
import type { CommentTask, DisposalTask } from '../types';

interface SentimentProcessFlowProps {
  sentimentId: string;
}

type BoardTask =
  | { id: string; kind: 'disposal'; label: '处置任务'; task: DisposalTask }
  | { id: string; kind: 'comment'; label: '网评任务'; task: CommentTask }
  | { id: string; kind: 'notification'; label: '通知任务'; task: CommentTask };

function getTaskStyle(kind: BoardTask['kind']) {
  const styles = {
    disposal: {
      icon: ClipboardList,
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-700',
    },
    notification: {
      icon: Bell,
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-50',
      iconText: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700',
    },
    comment: {
      icon: MessageSquare,
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
    },
  };

  return styles[kind];
}

function getTaskTitle(item: BoardTask) {
  if (item.kind === 'disposal') {
    return item.task.measures || item.task.progress || item.task.sentimentTitle;
  }

  return item.task.goal || item.task.requirements.contentDirection || item.task.sentimentTitle;
}

function getTaskDeadline(item: BoardTask) {
  return item.kind === 'disposal' ? item.task.deadline : item.task.requirements.deadline;
}

function getTaskAssignee(item: BoardTask) {
  return getAssignmentDisplayName(item.task.assignmentTargets, item.task.assignee);
}

export function SentimentProcessFlow({ sentimentId }: SentimentProcessFlowProps) {
  const { sentiments } = useSentimentData();
  const { disposalTasks, commentTasks } = useTaskWorkflow();
  const sentiment = sentiments.find((item) => item.id === sentimentId);
  const relatedDisposalTasks = disposalTasks.filter((task) => task.sentimentId === sentimentId);
  const relatedCommentTasks = commentTasks.filter((task) => task.sentimentId === sentimentId);

  if (!sentiment) {
    return <div className="text-sm text-gray-500">未找到关联舆情数据</div>;
  }

  const boardTasks: BoardTask[] = [
    ...relatedDisposalTasks.map((task): BoardTask => ({
      id: task.id,
      kind: 'disposal',
      label: '处置任务',
      task,
    })),
    ...relatedCommentTasks.map((task): BoardTask => ({
      id: task.id,
      kind: task.taskCategory === 'notification' ? 'notification' : 'comment',
      label: task.taskCategory === 'notification' ? '通知任务' : '网评任务',
      task,
    })),
  ].sort((left, right) => new Date(left.task.createdAt).getTime() - new Date(right.task.createdAt).getTime());

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        任务看板
      </h3>

      <div className="overflow-x-auto pb-2">
        <div className="relative flex min-w-[1120px] items-start gap-16">
          <div className="flex w-[340px] shrink-0 items-center">
            <Card className="w-full border-l-4 border-l-rose-500 bg-white">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      </div>
                      <span className="text-sm font-medium text-rose-600">当前事件</span>
                    </div>
                    <div className="line-clamp-3 text-base font-semibold text-slate-900">{sentiment.title}</div>
                  </div>
                  <Badge className="bg-rose-50 text-rose-700">{sentiment.level}</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>截止：{sentiment.deadline || sentiment.publishTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{sentiment.createdBy} · {sentiment.source}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative flex-1 py-2">
            <div className="absolute left-[-64px] top-1/2 h-0.5 w-16 -translate-y-1/2 bg-blue-200" />
            {boardTasks.length > 0 ? (
              <>
                <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-blue-200" />
                <div className="space-y-5 pl-10">
                  {boardTasks.map((item) => {
                    const style = getTaskStyle(item.kind);
                    const Icon = style.icon;

                    return (
                      <div key={item.id} className="relative">
                        <div className="absolute left-[-40px] top-10 h-0.5 w-10 bg-blue-200" />
                        <div className="absolute left-[-44px] top-[35px] h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />
                        <Card className={`border-l-4 ${style.border} bg-white`}>
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${style.iconBg}`}>
                                    <Icon className={`h-4 w-4 ${style.iconText}`} />
                                  </div>
                                  <span className={`text-sm font-medium ${style.iconText}`}>{item.label}</span>
                                </div>
                                <div className="line-clamp-2 text-sm font-semibold text-slate-900">{getTaskTitle(item)}</div>
                              </div>
                              <Badge className={style.badge}>{item.task.status}</Badge>
                            </div>

                            <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                <span>负责人：{getTaskAssignee(item)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>截止：{getTaskDeadline(item)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="relative rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">
                <div className="absolute left-[-64px] top-1/2 h-0.5 w-16 -translate-y-1/2 bg-blue-200" />
                当前事件尚未指派任务
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
