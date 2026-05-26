import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { CommentTaskDetailDialog } from './CommentTaskDetailDialog';
import type { CommentTask } from '../../types';
import { useSentimentData } from '../../context/SentimentDataContext';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';
import { getAssignmentDisplayName } from '../../utils/assignmentTargets';
import { getDeadlineClassName } from '../../utils/taskDeadline';

export function NotificationTaskList() {
  const { sentiments } = useSentimentData();
  const { commentTasks, confirmNotificationTask } = useTaskWorkflow();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentTask, setCurrentTask] = useState<CommentTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const notificationTasks = commentTasks.filter((task) => task.taskCategory === 'notification');
  const filteredTasks = notificationTasks.filter((task) => {
    const assignee = getAssignmentDisplayName(task.assignmentTargets, task.assignee);
    return !searchKeyword
      || task.sentimentTitle.toLowerCase().includes(searchKeyword.toLowerCase())
      || assignee.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  const getStatusBadge = (status: CommentTask['status']) => {
    const styles: Record<string, string> = {
      未接收: 'bg-gray-100 text-gray-700',
      已接收: 'bg-teal-100 text-teal-700',
      已知悉: 'bg-green-100 text-green-700',
      已完结: 'bg-purple-100 text-purple-700',
    };

    return <Badge className={styles[status] || 'bg-blue-100 text-blue-700'}>{status}</Badge>;
  };

  const getSentimentLevel = (task: CommentTask) => (
    sentiments.find((item) => item.id === task.sentimentId)?.level || '一般'
  );

  const openConfirm = (task: CommentTask) => {
    setCurrentTask(task);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!currentTask) {
      return;
    }

    confirmNotificationTask(currentTask.id);
    setIsConfirmOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">通知任务</h1>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[260px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索舆情标题、负责人..."
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            待知悉：
            <span className="font-semibold text-red-600">
              {notificationTasks.filter((task) => !['已知悉', '已完结'].includes(task.status)).length}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            已完结：
            <span className="font-semibold text-green-600">
              {notificationTasks.filter((task) => ['已知悉', '已完结'].includes(task.status)).length}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[360px]">舆情标题</TableHead>
              <TableHead>等级</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>截止时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => {
              const completed = ['已知悉', '已完结'].includes(task.status);

              return (
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
                  <TableCell>
                    <Badge variant="outline">{getSentimentLevel(task)}</Badge>
                  </TableCell>
                  <TableCell>{getAssignmentDisplayName(task.assignmentTargets, task.assignee)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{task.createdAt}</TableCell>
                  <TableCell className={`text-sm ${getDeadlineClassName(task.requirements.deadline, completed)}`}>
                    {task.requirements.deadline}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTask(task);
                          setIsDetailOpen(true);
                        }}
                      >
                        查看详情
                      </Button>
                      {!completed ? (
                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => openConfirm(task)}>
                          确认知悉
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CommentTaskDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={currentTask}
      />

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[32rem] bg-white">
          <DialogHeader>
            <DialogTitle>确认知悉通知任务</DialogTitle>
            <DialogDescription>
              确认后该通知任务将置为已完结，不需要提交处置材料。
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {currentTask?.sentimentTitle}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>
              确认知悉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
