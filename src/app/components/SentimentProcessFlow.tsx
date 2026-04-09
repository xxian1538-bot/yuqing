import { mockSentiments, mockDisposalTasks, mockCommentTasks } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, ClipboardList, MessageSquare, ArrowDown, User, Calendar } from 'lucide-react';

interface SentimentProcessFlowProps {
  sentimentId: string;
}

export function SentimentProcessFlow({ sentimentId }: SentimentProcessFlowProps) {
  const sentiment = mockSentiments.find(s => s.id === sentimentId);
  const disposalTasks = mockDisposalTasks.filter(t => t.sentimentId === sentimentId);
  
  if (!sentiment) return <div>未找到关联舆情数据</div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <AlertCircle className="text-blue-600" /> 全景链路视图
      </h3>

      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-12 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
        
        {/* Layer 1: Sentiment Event */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-base line-clamp-1">{sentiment.title}</div>
                <Badge variant="destructive">{sentiment.level}</Badge>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {sentiment.publishTime}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3"/> {sentiment.createdBy} (上报)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layer 2: Disposal Tasks */}
        {disposalTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-4 relative z-10 bg-gray-50">暂无处置任务</div>
        ) : disposalTasks.map((dTask, dIndex) => {
          const relatedComments = mockCommentTasks.filter(c => c.disposalTaskId === dTask.id || (c.sentimentId === sentimentId && !c.disposalTaskId && dIndex === 0));
          
          return (
            <div key={dTask.id} className="space-y-8">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-gray-800">处置任务: {dTask.sentimentTitle}</div>
                      <Badge className="bg-blue-100 text-blue-700">{dTask.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded line-clamp-2">
                      措施：{dTask.measures}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> 截止: {dTask.deadline}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> 负责人: {dTask.assignee}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Layer 3: Comment Tasks related to this Disposal Task */}
              {relatedComments.length > 0 && (
                <div className="relative pl-12 md:pl-0 space-y-6">
                  {relatedComments.map((cTask) => (
                    <div key={cTask.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-3rem)] hover:shadow-md transition-shadow border-l-4 border-l-green-500 bg-green-50/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-sm text-gray-800">网评任务: {cTask.goal}</div>
                            <Badge className="bg-green-100 text-green-700">{cTask.status}</Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            <span className="font-semibold text-gray-700">要求：</span>发帖 {cTask.requirements.postCount} 条 | 平台: {cTask.requirements.platforms.join(', ')}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="flex items-center gap-1"><User className="w-3 h-3"/> 网评员: {cTask.assignee}</span>
                            <span className="font-medium text-green-600">进度: {cTask.submissions.length}/{cTask.requirements.postCount}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
