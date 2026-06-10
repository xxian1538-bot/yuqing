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
import { HandleDisposalDialog } from './HandleDisposalDialog';
import { TaskDetailDialog } from './TaskDetailDialog';
import { CreateDisposalTask } from './CreateDisposalTask';
import { TaskCompletionReviewDialog } from '../TaskCompletionReviewDialog';
import { TableActions } from '../TableActions';
import type { DisposalTask } from '../../types';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';
import { getAssignmentDisplayName } from '../../utils/assignmentTargets';
import { getDeadlineClassName } from '../../utils/taskDeadline';

export function DisposalTasks() {
  const {
    disposalTasks: tasks,
    workflowConfigs,
    createDisposalTask,
    acceptDisposalTask,
    saveDisposalExecution,
    submitDisposalForReview,
  } = useTaskWorkflow();
  const [isHandleOpen, setIsHandleOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<DisposalTask | null>(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState('全部');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleDisposalSubmit = (details: string, attachment: string, completedAt: string) => {
    if (!currentTask) return;
    saveDisposalExecution({
      taskId: currentTask.id,
      details,
      attachment,
      completedAt,
    });
  };

  const handleCompletionSubmit = (workflowConfigId: string, summary: string) => {
    if (!currentTask) return;
    submitDisposalForReview({
      taskId: currentTask.id,
      workflowConfigId,
      summary,
    });
  };

  const getStatusBadge = (status: DisposalTask['status']) => {
    const styles = {
      '未接收': 'bg-gray-100 text-gray-700',
      '已接收': 'bg-teal-100 text-teal-700',
      '处置中': 'bg-blue-100 text-blue-700',
      '审核中': 'bg-amber-100 text-amber-700',
      '已完成': 'bg-green-100 text-green-700',
      '无法处置': 'bg-red-100 text-red-700',
      '已完结': 'bg-purple-100 text-purple-700',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  // 获取等级标签
  const getLevelBadge = (level: string) => {
    const styles = {
      '轻微': 'bg-blue-100 text-blue-700',
      '一般': 'bg-yellow-100 text-yellow-700',
      '较大': 'bg-orange-100 text-orange-700',
      '重大': 'bg-red-100 text-red-700',
      '特别重大': 'bg-purple-100 text-purple-700',
    };
    return <Badge className={styles[level as keyof typeof styles] || 'bg-gray-100 text-gray-700'}>{level}</Badge>;
  };

  const filteredTasks = tasks.filter(task => {
    if (
      searchKeyword &&
      !task.sentimentTitle.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !getAssignmentDisplayName(task.assignmentTargets, task.assignee).toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }
    // Simplistic date filtering (real implementation would parse Dates accurately)
    // Date filtering using createdAt
    return true; // Skipping complex date math for mock data, normally you'd implement full logic here
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">处置任务</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </Button>
            <Button variant="outline">导出记录</Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">待处理：</span>
              <span className="font-semibold text-red-600">
                {tasks.filter(t => ['未接收', '已接收', '处置中', '审核中'].includes(t.status)).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">已完成：</span>
              <span className="font-semibold text-green-600">
                {tasks.filter(t => t.status === '已完成' || t.status === '已完结').length}
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
                placeholder="搜索标题、负责人姓名..."
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
              <TableHead className="w-[28%]">舆情标题</TableHead>
              <TableHead className="w-[8%]">等级</TableHead>
              <TableHead className="w-[18%]">负责人</TableHead>
              <TableHead className="w-[10%]">状态</TableHead>
              <TableHead className="w-[12%]">创建时间</TableHead>
              <TableHead className="w-[12%]">截止时间</TableHead>
              <TableHead className="w-[12%] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
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
                </TableCell>
                <TableCell className="whitespace-nowrap">{getLevelBadge(task.level)}</TableCell>
                <TableCell>
                  <div className="line-clamp-2" title={getAssignmentDisplayName(task.assignmentTargets, task.assignee)}>
                    {getAssignmentDisplayName(task.assignmentTargets, task.assignee)}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{getStatusBadge(task.status)}</TableCell>
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  {task.createdAt}
                </TableCell>
                <TableCell className={`whitespace-nowrap text-sm ${getDeadlineClassName(task.deadline, ['已完成', '已完结'].includes(task.status))}`}>
                  {task.deadline}
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    actions={[
                      <Button variant="ghost" size="sm" onClick={() => {
                        setCurrentTask(task);
                        setIsDetailOpen(true);
                      }}>查看详情</Button>,
                      task.status === '未接收' ? (
                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => acceptDisposalTask(task.id)}>
                          接收
                        </Button>
                      ) : null,
                      ['已接收', '处置中'].includes(task.status) ? (
                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => {
                          setCurrentTask(task);
                          setIsHandleOpen(true);
                        }}>
                          执行
                        </Button>
                      ) : null,
                      ['已接收', '处置中'].includes(task.status) ? (
                        <Button variant="ghost" size="sm" className="text-green-600" onClick={() => {
                          setCurrentTask(task);
                          setIsReviewOpen(true);
                        }}>
                          完结
                        </Button>
                      ) : null,
                      (task.reviewStatus === '待审核' || task.status === '审核中') ? (
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

      <HandleDisposalDialog
        open={isHandleOpen}
        onOpenChange={setIsHandleOpen}
        task={currentTask}
        onSubmit={handleDisposalSubmit}
      />

      <TaskCompletionReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        title="处置任务完结送审"
        workflowConfigs={workflowConfigs.filter((item) => item.scene === 'disposal' && item.enabled)}
        defaultSummary={currentTask?.result || currentTask?.progress || '已完成处置任务执行，申请完结审核。'}
        onSubmit={handleCompletionSubmit}
      />

      <TaskDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={currentTask}
      />
      <CreateDisposalTask
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={createDisposalTask}
      />
    </div>
  );
}
