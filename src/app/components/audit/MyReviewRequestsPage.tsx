import { Badge } from '../ui/badge';
import { useTaskWorkflow } from '../../context/TaskWorkflowContext';
import { useSentimentData } from '../../context/SentimentDataContext';

export function MyReviewRequestsPage() {
  const { reviewRequests, closureRecords } = useTaskWorkflow();
  const { sentiments } = useSentimentData();
  const myItems = reviewRequests.filter((item) => item.requester === '舆情管理员');
  const myClosures = closureRecords.filter((item) => item.confirmedBy === '业务分管领导');

  const getStatusBadge = (status: string) => {
    const styles = {
      待审核: 'bg-amber-100 text-amber-700',
      审核通过: 'bg-green-100 text-green-700',
      审核不通过: 'bg-red-100 text-red-700',
    };

    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">我发起的</h1>
      </div>

      <div className="space-y-4">
        {myItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900">{item.sentimentTitle}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {item.taskType === 'disposal' ? '处置任务' : '网评任务'} · {item.workflowConfigName}
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>

            <div className="rounded-md bg-gray-50 p-4 text-sm leading-6 text-gray-700">{item.summary}</div>

            <div className="mt-3 text-xs text-gray-500">
              提交时间：{item.submittedAt}
              {item.reviewer ? ` · 审核人：${item.reviewer}` : ''}
              {item.reviewedAt ? ` · 审核时间：${item.reviewedAt}` : ''}
            </div>

            {item.comment ? (
              <div className="mt-3 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600">
                审核意见：{item.comment}
              </div>
            ) : null}
          </div>
        ))}

        <div className="pt-4">
          <h2 className="mb-4 text-lg font-semibold">领导完结记录</h2>
          <div className="space-y-4">
            {myClosures.length > 0 ? myClosures.map((item) => {
              const sentiment = sentiments.find((record) => record.id === item.sentimentId);
              return (
                <div key={item.sentimentId} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{sentiment?.title || item.sentimentId}</div>
                      <div className="mt-1 text-sm text-gray-500">领导确认完结</div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">已完结</Badge>
                  </div>

                  <div className="rounded-md bg-gray-50 p-4 text-sm leading-6 text-gray-700">{item.note}</div>

                  <div className="mt-3 text-xs text-gray-500">
                    确认人：{item.confirmedBy} · 确认时间：{item.confirmedAt}
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                暂无领导完结记录
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
