import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';

export function PendingReviewsPage() {
  const { reviewRequests, approveReview, rejectReview } = useTaskWorkflow();
  const [comments, setComments] = useState<Record<string, string>>({});
  const pendingItems = reviewRequests.filter((item) => item.status === '待审核');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">待审核</h1>
      </div>

      <div className="space-y-4">
        {pendingItems.length > 0 ? pendingItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900">{item.sentimentTitle}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {item.taskType === 'disposal' ? '处置任务' : '网评任务'} · {item.workflowConfigName}
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700">待审核</Badge>
            </div>

            <div className="rounded-md bg-gray-50 p-4 text-sm leading-6 text-gray-700">{item.summary}</div>

            <div className="mt-3 text-xs text-gray-500">
              发起人：{item.requester} · 提交时间：{item.submittedAt}
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <Input
                value={comments[item.id] || ''}
                onChange={(event) => setComments((prev) => ({ ...prev, [item.id]: event.target.value }))}
                placeholder="填写审核意见"
              />
              <div className="flex gap-3">
                <Button onClick={() => approveReview(item.id, comments[item.id] || '审核通过')}>
                  通过
                </Button>
                <Button variant="outline" onClick={() => rejectReview(item.id, comments[item.id] || '审核退回，请补充材料')}>
                  退回
                </Button>
              </div>
            </div>
          </div>
        )) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            当前没有待审核任务
          </div>
        )}
      </div>
    </div>
  );
}
