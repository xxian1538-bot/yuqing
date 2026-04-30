import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { AlertCircle, Calendar, ClipboardList, MessageSquare, User } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { getAssignmentDisplayName } from '../utils/assignmentTargets';

interface SentimentProcessFlowProps {
  sentimentId: string;
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

  const branches = relatedDisposalTasks.map((disposalTask, index) => {
    const relatedComments = commentTasks.filter(
      (commentTask) =>
        commentTask.disposalTaskId === disposalTask.id ||
        (commentTask.sentimentId === sentimentId && !commentTask.disposalTaskId && index === 0),
    );

    return {
      disposalTask,
      relatedComments,
    };
  });

  const orphanCommentTasks =
    relatedDisposalTasks.length === 0
      ? relatedCommentTasks
      : [];

  return (
    <div className="rounded-[8px] bg-[#fafafa] p-6">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <AlertCircle className="h-5 w-5 text-[#1677ff]" />
        全景链路视图
      </h3>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[1200px] items-start gap-10">
          <div className="flex w-[340px] shrink-0 items-center">
            <Card className="w-full border-l-4 border-l-[#ff4d4f] bg-white">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1f0]">
                        <AlertCircle className="h-4 w-4 text-[#ff4d4f]" />
                      </div>
                      <span className="text-sm font-medium text-[#ff4d4f]">当前事件</span>
                    </div>
                    <div className="line-clamp-3 text-base font-semibold text-gray-900">{sentiment.title}</div>
                  </div>
                  <Badge className="bg-[#fff1f0] text-[#cf1322]">{sentiment.level}</Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{sentiment.publishTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{sentiment.createdBy} · {sentiment.source}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="h-0.5 w-10 shrink-0 bg-[#d9d9d9]" />
          </div>

          <div className="flex-1 space-y-8">
            {branches.length > 0 ? branches.map(({ disposalTask, relatedComments }) => (
              <div key={disposalTask.id} className="relative flex items-start gap-6">
                <div className="absolute left-[-40px] top-10 h-0.5 w-10 bg-[#d9d9d9]" />

                <div className="w-[360px] shrink-0">
                  <Card className="border-l-4 border-l-[#1677ff] bg-white">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f4ff]">
                              <ClipboardList className="h-4 w-4 text-[#1677ff]" />
                            </div>
                            <span className="text-sm font-medium text-[#1677ff]">处置任务</span>
                          </div>
                          <div className="line-clamp-2 text-sm font-semibold text-gray-900">{disposalTask.sentimentTitle}</div>
                        </div>
                        <Badge className="bg-[#e6f4ff] text-[#1677ff]">{disposalTask.status}</Badge>
                      </div>

                      <div className="rounded-[6px] bg-[#fafafa] p-3 text-xs leading-5 text-gray-600">
                        {disposalTask.measures}
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          <span>负责人：{getAssignmentDisplayName(disposalTask.assignmentTargets, disposalTask.assignee)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>截止：{disposalTask.deadline}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-1 space-y-4">
                  {relatedComments.length > 0 ? relatedComments.map((commentTask) => (
                    <div key={commentTask.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-0 top-8 h-0.5 w-8 bg-[#d9d9d9]" />

                      <Card className="w-full border-l-4 border-l-[#52c41a] bg-[#fcfff5]">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6ffed]">
                                  <MessageSquare className="h-4 w-4 text-[#52c41a]" />
                                </div>
                                <span className="text-sm font-medium text-[#389e0d]">网评任务</span>
                              </div>
                              <div className="line-clamp-2 text-sm font-semibold text-gray-900">{commentTask.goal}</div>
                            </div>
                            <Badge className="bg-[#f6ffed] text-[#389e0d]">{commentTask.status}</Badge>
                          </div>

                          <div className="space-y-2 text-xs text-gray-600">
                            <div>
                              发帖 {commentTask.requirements.postCount} 条 · 平台：{commentTask.requirements.platforms.join('、')}
                            </div>
                            <div className="flex items-center justify-between text-gray-500">
                              <span className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                网评员：{getAssignmentDisplayName(commentTask.assignmentTargets, commentTask.assignee)}
                              </span>
                              <span>进度：{commentTask.submissions.length}/{commentTask.requirements.postCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )) : (
                    <div className="relative rounded-[8px] border border-dashed border-[#d9d9d9] bg-white px-5 py-6 text-sm text-gray-500">
                      <div className="absolute left-[-24px] top-1/2 h-0.5 w-6 bg-[#d9d9d9]" />
                      当前处置任务下暂无网评任务
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="relative flex items-start gap-6">
                <div className="absolute left-[-40px] top-10 h-0.5 w-10 bg-[#d9d9d9]" />
                <div className="w-[360px] shrink-0 rounded-[8px] border border-dashed border-[#d9d9d9] bg-white px-5 py-6 text-sm text-gray-500">
                  当前事件尚未指派处置任务
                </div>

                {orphanCommentTasks.length > 0 ? (
                  <div className="flex-1 space-y-4">
                    {orphanCommentTasks.map((commentTask) => (
                      <div key={commentTask.id} className="relative flex items-start gap-4 pl-8">
                        <div className="absolute left-0 top-8 h-0.5 w-8 bg-[#d9d9d9]" />
                        <Card className="w-full border-l-4 border-l-[#52c41a] bg-[#fcfff5]">
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6ffed]">
                                    <MessageSquare className="h-4 w-4 text-[#52c41a]" />
                                  </div>
                                  <span className="text-sm font-medium text-[#389e0d]">网评任务</span>
                                </div>
                                <div className="line-clamp-2 text-sm font-semibold text-gray-900">{commentTask.goal}</div>
                              </div>
                              <Badge className="bg-[#f6ffed] text-[#389e0d]">{commentTask.status}</Badge>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600">
                              <div>
                                发帖 {commentTask.requirements.postCount} 条 · 平台：{commentTask.requirements.platforms.join('、')}
                              </div>
                              <div className="flex items-center justify-between text-gray-500">
                                <span className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5" />
                                  网评员：{getAssignmentDisplayName(commentTask.assignmentTargets, commentTask.assignee)}
                                </span>
                                <span>进度：{commentTask.submissions.length}/{commentTask.requirements.postCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
