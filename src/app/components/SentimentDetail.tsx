import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft, 
  ExternalLink, 
  Send, 
  UserPlus,
  Download,
  Eye,
  ThumbsUp,
  Share2,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { mockSentiments } from '../data/mockData';
import { SentimentProcessFlow } from './SentimentProcessFlow';
import type { EmotionTrend, SentimentStatus } from '../types';

export function SentimentDetail() {
  const { id } = useParams();
  const sentiment = mockSentiments.find(s => s.id === id);

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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              报送
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              指派任务
            </Button>
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
      </div>

      {/* 详细信息 */}
      <Tabs defaultValue="process" className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="process">全景链路视图</TabsTrigger>
            <TabsTrigger value="content">舆情内容</TabsTrigger>
            <TabsTrigger value="analysis">情感分析</TabsTrigger>
            <TabsTrigger value="spread">传播轨迹</TabsTrigger>
            <TabsTrigger value="comments">相关评论</TabsTrigger>
            <TabsTrigger value="disposal">处置记录</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="process" className="p-6">
          <SentimentProcessFlow sentimentId={sentiment.id} />
        </TabsContent>

        <TabsContent value="content" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">内容摘要</h3>
              <p className="text-gray-700 leading-relaxed">{sentiment.summary}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">完整内容</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{sentiment.content}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">原文链接</h3>
              <a 
                href={sentiment.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:underline"
              >
                {sentiment.link}
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-3">研判意见</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{sentiment.analysis}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>情感倾向分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">正面情绪</span>
                      <span className="text-sm font-medium">
                        {sentiment.emotionTrend === '正面' ? '85%' : '15%'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: sentiment.emotionTrend === '正面' ? '85%' : '15%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">中性情绪</span>
                      <span className="text-sm font-medium">
                        {sentiment.emotionTrend === '中性' ? '70%' : '10%'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: sentiment.emotionTrend === '中性' ? '70%' : '10%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">负面情绪</span>
                      <span className="text-sm font-medium">
                        {sentiment.emotionTrend === '负面' ? '80%' : '5%'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ width: sentiment.emotionTrend === '负面' ? '80%' : '5%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>高频关键词</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['改革', '礼金', '习俗', '传统', '现代', '观念', '讨论', '网友'].map((keyword) => (
                    <Badge key={keyword} variant="outline" className="px-3 py-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {sentiment.score && (
              <Card>
                <CardHeader>
                  <CardTitle>舆情评分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-semibold text-blue-600">{sentiment.score}</div>
                    <div className="text-sm text-gray-600">
                      综合评分基于话题分类、关注度、情感倾向、媒体扩散度、传播形式、传播渠道和账号影响力等多个维度
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spread" className="p-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>传播渠道分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentiment.source.split('、').map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{channel}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${80 - index * 15}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {80 - index * 15}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>传播时间线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <div className="w-0.5 h-full bg-gray-200" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm font-medium mb-1">{sentiment.publishTime}</div>
                      <div className="text-sm text-gray-600">舆情首次发布</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <div className="w-0.5 h-full bg-gray-200" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm font-medium mb-1">2小时后</div>
                      <div className="text-sm text-gray-600">传播至主流媒体平台</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">6小时后</div>
                      <div className="text-sm text-gray-600">达到传播峰值</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="p-6">
          <div className="space-y-4">
            {[
              { user: '网友A', time: '2小时前', content: '这个问题确实值得讨论，不同地方习俗差异很大', emotion: '中性' },
              { user: '网友B', time: '3小时前', content: '我觉得应该相互理解，重要的是心意', emotion: '正面' },
              { user: '网友C', time: '5小时前', content: '太贵了吧，压力很大啊', emotion: '负面' },
            ].map((comment, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{comment.user}</div>
                      <div className="text-xs text-gray-500">{comment.time}</div>
                    </div>
                  </div>
                  <Badge className={
                    comment.emotion === '正面' ? 'bg-green-100 text-green-700' :
                    comment.emotion === '负面' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {comment.emotion}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disposal" className="p-6">
          <div className="space-y-4">
            {sentiment.status !== '未处理' ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>处置进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-600 rounded-full" />
                          <div className="w-0.5 h-full bg-gray-200" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-sm font-medium mb-1">任务已创建</div>
                          <div className="text-xs text-gray-500">{sentiment.publishTime}</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-600 rounded-full" />
                          <div className="w-0.5 h-full bg-gray-200" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-sm font-medium mb-1">已分配责任人</div>
                          <div className="text-xs text-gray-500">负责人：{sentiment.assignee}</div>
                        </div>
                      </div>
                      {sentiment.status === '已办结' && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-green-600 rounded-full" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-1">处置完成</div>
                            <div className="text-xs text-gray-500">任务已审核通过</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无处置记录
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
