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

  const hasPendingDisposal = relatedDisposals.some((task) => task.status !== '已完结');
  const hasPendingComment = relatedComments.some((task) => task.status !== '已审核');

  if (hasPendingDisposal || hasPendingComment) {
    return '处置中';
  }

  return '待完结';
}
