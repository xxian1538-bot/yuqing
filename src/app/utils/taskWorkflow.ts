import type {
  CommentTask,
  DisposalTask,
  SentimentInfo,
  SentimentTaskStatus,
} from '../types';

export function getSentimentTaskStatus(
  sentiment: SentimentInfo,
  disposalTasks: DisposalTask[],
  commentTasks: CommentTask[],
): SentimentTaskStatus {
  if (sentiment.status === '已办结') {
    return '已完结';
  }

  const relatedDisposals = disposalTasks.filter((task) => task.sentimentId === sentiment.id);
  const relatedComments = commentTasks.filter((task) => task.sentimentId === sentiment.id);

  if (relatedDisposals.length === 0 && relatedComments.length === 0) {
    return '待指派';
  }

  const hasPendingDisposal = relatedDisposals.some((task) => !['已完成', '已完结'].includes(task.status));
  const hasPendingComment = relatedComments.some((task) => (
    task.taskCategory === 'notification'
      ? !['已知悉', '已完结'].includes(task.status)
      : task.status !== '已完结'
  ));

  if (hasPendingDisposal || hasPendingComment) {
    return '处置中';
  }

  return '待完结';
}
