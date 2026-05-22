import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, Clock, Calendar, Route, AlertCircle, ClipboardList, MessageSquare, User } from 'lucide-react';
import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { getAssignmentDisplayName } from '../utils/assignmentTargets';

interface SentimentProcessEvaluationProps {
  sentimentId: string;
}

export function SentimentProcessEvaluation({ sentimentId }: SentimentProcessEvaluationProps) {
  const { sentiments } = useSentimentData();
  const { disposalTasks, commentTasks } = useTaskWorkflow();
  const sentiment = sentiments.find((s) => s.id === sentimentId);
  const relatedDisposalTasks = disposalTasks.filter((t) => t.sentimentId === sentimentId);
  const relatedCommentTasks = commentTasks.filter((t) => t.sentimentId === sentimentId);

  if (!sentiment) {
    return <div className="text-sm text-gray-500">未找到关联舆情数据</div>;
  }

  const eventStartTime = new Date(sentiment.publishTime);
  const firstDisposalTask = [...relatedDisposalTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  const allTaskUpdateTimes = [...relatedDisposalTasks, ...relatedCommentTasks]
    .map((task) => new Date(task.updatedAt).getTime())
    .filter((time) => !Number.isNaN(time));
  const eventEndTime = allTaskUpdateTimes.length > 0 ? new Date(Math.max(...allTaskUpdateTimes)) : null;
  const totalTaskCount = relatedDisposalTasks.length + relatedCommentTasks.length;
  const latestResult = [...relatedDisposalTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .find((task) => task.result || task.progress);

  const formatDuration = (start: Date, end?: Date | null) => {
    if (!end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '暂未形成';
    }

    const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}天${hours}小时`;
    }
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const flowSteps = [
    {
      title: '舆情发现入库',
      time: sentiment.publishTime,
      description: `${sentiment.createdBy}发现并入库，来源平台：${sentiment.source}`,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    ...(firstDisposalTask ? [{
      title: '介入处理',
      time: firstDisposalTask.createdAt,
      description: `${getAssignmentDisplayName(firstDisposalTask.assignmentTargets, firstDisposalTask.assignee)}介入处理，流转耗时：${formatDuration(eventStartTime, new Date(firstDisposalTask.createdAt))}`,
      icon: User,
      color: 'bg-blue-500',
    }] : []),
    ...relatedDisposalTasks.map((task) => ({
      title: '处置任务执行',
      time: task.updatedAt,
      description: `${getAssignmentDisplayName(task.assignmentTargets, task.assignee)}：${task.result || task.progress || task.measures}`,
      icon: ClipboardList,
      color: task.status === '已完成' || task.status === '已完结' ? 'bg-green-500' : 'bg-blue-500',
    })),
    ...relatedCommentTasks.map((task) => ({
      title: '网评任务执行',
      time: task.updatedAt,
      description: `${getAssignmentDisplayName(task.assignmentTargets, task.assignee)}完成 ${task.submissions.length}/${task.requirements.postCount} 条提交，状态：${task.status}`,
      icon: MessageSquare,
      color: task.status === '已审核' ? 'bg-green-500' : 'bg-emerald-500',
    })),
    ...(sentiment.status === '已办结' && eventEndTime ? [{
      title: '事件办结',
      time: eventEndTime.toLocaleString('zh-CN', { hour12: false }),
      description: latestResult?.result || latestResult?.progress || '事件已完成处置闭环',
      icon: CheckCircle2,
      color: 'bg-green-600',
    }] : []),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              发现入库
            </div>
            <div className="text-sm font-semibold text-gray-900">{sentiment.publishTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              流转至执行
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {firstDisposalTask ? formatDuration(eventStartTime, new Date(firstDisposalTask.createdAt)) : '暂无任务'}
            </div>
            {firstDisposalTask && <div className="mt-1 text-xs text-gray-500">由 {getAssignmentDisplayName(firstDisposalTask.assignmentTargets, firstDisposalTask.assignee)} 介入</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <Route className="h-4 w-4" />
              任务总数
            </div>
            <div className="text-sm font-semibold text-gray-900">{totalTaskCount} 个</div>
            <div className="mt-1 text-xs text-gray-500">处置 {relatedDisposalTasks.length} 个，网评 {relatedCommentTasks.length} 个</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4" />
              总体耗时
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {sentiment.status === '已办结' ? formatDuration(eventStartTime, eventEndTime) : '处理中'}
            </div>
            <div className="mt-1 text-xs text-gray-500">{sentiment.status}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">自动评价结论</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-gray-700">
            {latestResult?.result || latestResult?.progress || '当前事件尚未形成处置结果。'}
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            系统评价：{firstDisposalTask ? '已形成明确介入节点' : '尚未形成处置节点'}，任务流转
            {totalTaskCount > 0 ? '完整' : '未启动'}，当前总体状态为“{sentiment.status}”。
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">过程评价时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={`${step.title}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    {index < flowSteps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{step.title}</span>
                      <span className="text-xs text-gray-500">{step.time}</span>
                    </div>
                    <p className="text-sm leading-6 text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
