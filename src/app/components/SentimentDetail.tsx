import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft, 
  ExternalLink, 
  Send, 
  UserPlus,
  Download,
  Pencil,
  Eye,
  ThumbsUp,
  Share2,
  MessageSquare,
  Star,
  Link2
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SentimentProcessFlow } from './SentimentProcessFlow';
import { SentimentProcessEvaluation } from './SentimentProcessEvaluation';
import { SentimentEditDialog } from './SentimentEditDialog';
import { AssignDialog } from './AssignDialog';
import { SentimentClosureDialog } from './SentimentClosureDialog';
import type { EmotionTrend, SentimentStatus } from '../types';
import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { getAssignmentDisplayName } from '../utils/assignmentTargets';

export function SentimentDetail() {
  const { id } = useParams();
  const { sentiments, updateSentiment } = useSentimentData();
  const { disposalTasks, commentTasks, getSentimentTaskStatusById, confirmSentimentClosure, getClosureRecordBySentimentId } = useTaskWorkflow();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isClosureOpen, setIsClosureOpen] = useState(false);
  const sentiment = sentiments.find(s => s.id === id);

  if (!sentiment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">舆情信息不存在</p>
          <Link to="/">
            <Button className="mt-4">返回列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedGroupIds = Array.from(new Set([
    sentiment.id,
    sentiment.primaryEventId,
    ...(sentiment.relatedEventIds || []),
  ].filter(Boolean))) as string[];
  const relatedEvents = sentiments
    .filter(item => relatedGroupIds.includes(item.id))
    .sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime());
  const hasRelatedEvents = relatedEvents.length > 1;
  const taskStatus = getSentimentTaskStatusById(sentiment.id);
  const relatedDisposalTasks = disposalTasks.filter((task) => task.sentimentId === sentiment.id);
  const relatedCommentTasks = commentTasks.filter((task) => task.sentimentId === sentiment.id);
  const closureRecord = getClosureRecordBySentimentId(sentiment.id);

  // 获取状态标签样式
  const getStatusBadge = (status: SentimentStatus) => {
    const styles = {
      '未处理': 'bg-red-100 text-red-700',
      '跟进中': 'bg-blue-100 text-blue-700',
      '已办结': 'bg-green-100 text-green-700',
    };
    return (
      <Badge className={styles[status]}>
        {status}
      </Badge>
    );
  };

  // 获取情感倾向标签样式
  const getEmotionBadge = (emotion: EmotionTrend) => {
    const styles = {
      '正面': 'bg-green-100 text-green-700',
      '中性': 'bg-gray-100 text-gray-700',
      '负面': 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={styles[emotion]}>
        {emotion}
      </Badge>
    );
  };

  const getTaskStatusBadge = () => {
    const styles = {
      待指派: 'bg-gray-100 text-gray-700',
      处置中: 'bg-blue-100 text-blue-700',
      待完结: 'bg-amber-100 text-amber-700',
      已完结: 'bg-green-100 text-green-700',
    };

    return <Badge className={styles[taskStatus]}>{taskStatus}</Badge>;
  };

  return (
    <div className="p-6">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </Link>
      </div>

      {/* 标题栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getStatusBadge(sentiment.status)}
              {getTaskStatusBadge()}
              {getEmotionBadge(sentiment.emotionTrend)}
              <Badge className={
                sentiment.level === '审批中' ? 'bg-orange-100 text-orange-700' :
                sentiment.level === '已通过' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }>
                {sentiment.level}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{sentiment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div>来源：{sentiment.source}</div>
              <div>发布时间：{sentiment.publishTime}</div>
              <div>领域：{sentiment.field}</div>
              <div>单位：{sentiment.unit}</div>
              {sentiment.assignee && <div>负责人：{sentiment.assignee}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              编辑事件
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              报送
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAssignOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              指派任务
            </Button>
            {taskStatus === '待完结' ? (
              <Button variant="outline" onClick={() => setIsClosureOpen(true)}>
                完结事件
              </Button>
            ) : null}
          </div>
        </div>

        {/* 传播数据 */}
        <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-sm">阅读量</span>
            </div>
            <div className="text-xl font-semibold">{sentiment.readCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="text-sm">评论量</span>
            </div>
            <div className="text-xl font-semibold">{sentiment.commentCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span className="text-sm">点赞量</span>
            </div>
            <div className="text-xl font-semibold">{sentiment.likeCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <Share2 className="w-4 h-4 mr-1" />
              <span className="text-sm">转发量</span>
            </div>
            <div className="text-xl font-semibold">{sentiment.shareCount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm">收藏量</span>
            </div>
            <div className="text-xl font-semibold">{sentiment.collectCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 space-y-5 border-t border-gray-200 pt-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">内容摘要</h3>
            <p className="text-sm leading-6 text-gray-700">{sentiment.summary}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">完整内容</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-700">{sentiment.content}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">原文链接</h3>
              <a
                href={sentiment.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                {sentiment.link}
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">研判意见</h3>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm leading-6 text-gray-700">{sentiment.analysis}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <Tabs defaultValue="process" className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="process">全景链路视图</TabsTrigger>
            {hasRelatedEvents && <TabsTrigger value="timeline">舆情事件脉络</TabsTrigger>}
            <TabsTrigger value="disposal">处置记录</TabsTrigger>
            <TabsTrigger value="evaluation">处置过程自动评价</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="process" className="p-6">
          <SentimentProcessFlow sentimentId={sentiment.id} />
        </TabsContent>

        {hasRelatedEvents && (
          <TabsContent value="timeline" className="p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    舆情事件脉络
                  </CardTitle>
                  <Badge variant="outline">共 {relatedEvents.length} 条关联事件</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {relatedEvents.map((event, index) => {
                    const isPrimary = event.primaryEventId === event.id;
                    const isCurrent = event.id === sentiment.id;

                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${isPrimary ? 'bg-blue-600' : 'bg-gray-400'}`} />
                          {index < relatedEvents.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{event.publishTime}</span>
                            {isPrimary && <Badge className="bg-blue-100 text-blue-700">主事件</Badge>}
                            {isCurrent && <Badge variant="outline">当前事件</Badge>}
                          </div>
                          <a
                            href={`/sentiment/${event.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1 font-medium text-blue-600 hover:underline"
                          >
                            <span>{event.title}</span>
                            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" />
                          </a>
                          <div className="mt-2 text-sm text-gray-600 line-clamp-2">{event.summary}</div>
                          <div className="mt-2 text-xs text-gray-500">{event.source} · {event.field}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="disposal" className="p-6">
          <div className="space-y-4">
            {relatedDisposalTasks.length > 0 || relatedCommentTasks.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>任务流转概览</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">处置任务</div>
                      <div className="mt-2 text-2xl font-semibold">{relatedDisposalTasks.length}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">网评任务</div>
                      <div className="mt-2 text-2xl font-semibold">{relatedCommentTasks.length}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">当前任务状态</div>
                      <div className="mt-2">{getTaskStatusBadge()}</div>
                    </div>
                  </CardContent>
                </Card>

                {relatedDisposalTasks.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>处置任务记录</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {relatedDisposalTasks.map((task) => (
                        <div key={task.id} className="rounded-md border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="font-medium text-gray-900">{getAssignmentDisplayName(task.assignmentTargets, task.assignee)}</div>
                            <Badge variant="outline">{task.status}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">{task.progress || task.measures}</div>
                          <div className="mt-2 text-xs text-gray-500">
                            创建时间：{task.createdAt} · 截止时间：{task.deadline}
                          </div>
                          {task.reviewStatus ? (
                            <div className="mt-2 text-xs text-gray-500">
                              审核状态：{task.reviewStatus}{task.reviewWorkflowName ? ` · ${task.reviewWorkflowName}` : ''}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                {relatedCommentTasks.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>网评任务记录</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {relatedCommentTasks.map((task) => (
                        <div key={task.id} className="rounded-md border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="font-medium text-gray-900">{getAssignmentDisplayName(task.assignmentTargets, task.assignee)}</div>
                            <Badge variant="outline">{task.status}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">{task.goal}</div>
                          <div className="mt-2 text-xs text-gray-500">
                            发帖 {task.submissions.length}/{task.requirements.postCount} · 截止时间：{task.requirements.deadline}
                          </div>
                          {task.reviewWorkflowName ? (
                            <div className="mt-2 text-xs text-gray-500">审核流：{task.reviewWorkflowName}</div>
                          ) : null}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                {closureRecord ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>领导确认完结</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md bg-green-50 p-4 text-sm leading-6 text-gray-700">
                        {closureRecord.note}
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {closureRecord.confirmedBy} · {closureRecord.confirmedAt}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无处置记录
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="p-6">
          <SentimentProcessEvaluation sentimentId={sentiment.id} />
        </TabsContent>
      </Tabs>

      <SentimentEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        sentiment={sentiment}
        onSubmit={(updates) => updateSentiment(sentiment.id, updates)}
      />

      <AssignDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        sentimentIds={[sentiment.id]}
        sentimentLevel={sentiment.level}
      />

      <SentimentClosureDialog
        open={isClosureOpen}
        onOpenChange={setIsClosureOpen}
        sentimentTitle={sentiment.title}
        onConfirm={(note) => confirmSentimentClosure(sentiment.id, note)}
      />
    </div>
  );
}
