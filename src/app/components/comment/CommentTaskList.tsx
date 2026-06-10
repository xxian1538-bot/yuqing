import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { CreateCommentTask } from './CreateCommentTask';
import { ExecuteCommentTaskDialog } from './ExecuteCommentTaskDialog';
import { CommentTaskDetailDialog } from './CommentTaskDetailDialog';
import { TaskCompletionReviewDialog } from '../TaskCompletionReviewDialog';
import { TableActions } from '../TableActions';
import type { CommentTask } from '../../types';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';
import { getAssignmentDisplayName } from '../../utils/assignmentTargets';
import { getDeadlineClassName } from '../../utils/taskDeadline';

export function CommentTaskList() {
  const {
    commentTasks: tasks,
    workflowConfigs,
    createCommentTask,
    acceptCommentTask,
    submitCommentExecution,
    submitCommentForReview,
  } = useTaskWorkflow();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState('全部');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<CommentTask | null>(null);

  const handleExecuteSubmit = (taskId: string, submission: any) => {
    submitCommentExecution({
      taskId,
      submission,
    });
  };

  const handleCompletionSubmit = (workflowConfigId: string, summary: string) => {
    if (!currentTask) return;
    submitCommentForReview({
      taskId: currentTask.id,
      workflowConfigId,
      summary,
    });
  };

  // 获取状态标签
  const getStatusBadge = (status: CommentTask['status']) => {
    const styles = {
      '未接收': 'bg-gray-100 text-gray-700',
      '已接收': 'bg-teal-100 text-teal-700',
      '未开始': 'bg-gray-100 text-gray-700',
      '进行中': 'bg-blue-100 text-blue-700',
      '审核中': 'bg-amber-100 text-amber-700',
      '已提交': 'bg-yellow-100 text-yellow-700',
      '已审核': 'bg-green-100 text-green-700',
      '未通过': 'bg-red-100 text-red-700',
      '已知悉': 'bg-green-100 text-green-700',
      '已完结': 'bg-purple-100 text-purple-700',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const filteredTasks = tasks.filter(task => {
    if (task.taskCategory === 'notification') {
      return false;
    }

    if (
      searchKeyword &&
      !task.sentimentTitle.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !getAssignmentDisplayName(task.assignmentTargets, task.assignee).toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }
    // Date filtering would go here based on task.createdAt
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">网评任务</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              发起网评任务
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">进行中：</span>
              <span className="font-semibold text-blue-600">
                {tasks.filter(t => ['已接收', '进行中'].includes(t.status)).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">待审核：</span>
              <span className="font-semibold text-yellow-600">
                {tasks.filter(t => ['审核中', '已提交'].includes(t.status)).length}
              </span>
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索舆情标题、负责人..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部时间</SelectItem>
                <SelectItem value="今日">今日</SelectItem>
                <SelectItem value="昨日">昨日</SelectItem>
                <SelectItem value="近7天">近7天</SelectItem>
                <SelectItem value="近30天">近30天</SelectItem>
                <SelectItem value="自定义">自定义时间</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "自定义" && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 pr-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-8 bg-white px-2 border"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-8 bg-white px-2 border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[27%]">舆情标题</TableHead>
              <TableHead className="w-[17%]">负责人</TableHead>
              <TableHead className="w-[10%]">任务类型</TableHead>
              <TableHead className="w-[9%]">要求发帖数</TableHead>
              <TableHead className="w-[8%]">已完成</TableHead>
              <TableHead className="w-[9%]">状态</TableHead>
              <TableHead className="w-[10%]">截止时间</TableHead>
              <TableHead className="w-[10%] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="line-clamp-2 text-left font-medium text-blue-600 hover:underline"
                      onClick={() => {
                        setCurrentTask(task);
                        setIsDetailOpen(true);
                      }}
                    >
                      {task.sentimentTitle}
                    </button>
                    <div className="line-clamp-2 text-xs text-gray-500" title={task.goal}>目标：{task.goal}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="line-clamp-2" title={getAssignmentDisplayName(task.assignmentTargets, task.assignee)}>
                    {getAssignmentDisplayName(task.assignmentTargets, task.assignee)}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={task.taskCategory === 'notification' ? 'secondary' : 'outline'}>
                    {task.taskCategory === 'notification' ? '通知任务' : '网评任务'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {task.taskCategory === 'notification' ? (
                    <span className="text-gray-500">无需发帖</span>
                  ) : (
                    <>
                      <span className="font-medium">{task.requirements.postCount}</span> 条
                    </>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {task.taskCategory === 'notification' ? (
                    <span className="text-gray-500">{task.status === '已知悉' ? '已确认' : '待确认'}</span>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">{task.submissions.length}</span> 条
                    </>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">{getStatusBadge(task.status)}</TableCell>
                <TableCell className={`whitespace-nowrap text-sm ${getDeadlineClassName(task.requirements.deadline, ['已完结', '已知悉'].includes(task.status))}`}>
                  {task.requirements.deadline}
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    actions={[
                      task.taskCategory !== 'notification' && ['未接收', '未开始'].includes(task.status) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => acceptCommentTask(task.id)}
                        >
                          接收
                        </Button>
                      ) : null,
                      task.taskCategory !== 'notification' && ['已接收', '进行中'].includes(task.status) ? (
                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => {
                          setCurrentTask(task);
                          setIsExecuteOpen(true);
                        }}>执行</Button>
                      ) : null,
                      task.taskCategory !== 'notification' && ['已接收', '进行中', '未通过'].includes(task.status) && task.submissions.length > 0 ? (
                        <Button variant="ghost" size="sm" className="text-green-600" onClick={() => {
                          setCurrentTask(task);
                          setIsReviewOpen(true);
                        }}>完结</Button>
                      ) : null,
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTask(task);
                          setIsDetailOpen(true);
                        }}
                      >
                        查看详情
                      </Button>,
                      ['审核中', '已提交'].includes(task.status) ? (
                        <span className="inline-flex h-8 items-center px-2 text-xs text-amber-600">审核中</span>
                      ) : null,
                    ].filter(Boolean)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateCommentTask
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={createCommentTask}
      />

      <ExecuteCommentTaskDialog
        open={isExecuteOpen}
        onOpenChange={setIsExecuteOpen}
        task={currentTask}
        onSubmit={handleExecuteSubmit}
      />

      <TaskCompletionReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        title="网评任务完结送审"
        workflowConfigs={workflowConfigs.filter((item) => item.scene === 'comment' && item.enabled)}
        defaultSummary={
          [...(currentTask?.submissions || [])].sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime())[0]?.summary
          || '已完成网评任务执行，申请完结审核。'
        }
        onSubmit={handleCompletionSubmit}
      />

      <CommentTaskDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={currentTask}
      />
    </div>
  );
}
