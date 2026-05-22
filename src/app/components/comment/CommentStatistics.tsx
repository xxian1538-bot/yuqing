import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockCommentTasks } from '../../data/mockData';

export function CommentStatistics() {
  const tasks = mockCommentTasks;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">总任务数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{tasks.length}</div>
              <div className="text-sm text-gray-600 mt-2">
                本月累计
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">完成率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {((tasks.filter(t => t.status === '已审核').length / tasks.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                较上月 +12.3%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">总发帖数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {tasks.reduce((sum, task) => sum + task.submissions.length, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                平均每任务 {(tasks.reduce((sum, task) => sum + task.submissions.length, 0) / tasks.length).toFixed(1)} 条
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">审核通过率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">95.2%</div>
              <div className="text-sm text-gray-600 mt-2">
                较上月 +3.1%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>平台分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['微博', '抖音', '今日头条', '知乎', '微信公众号'].map((platform, index) => {
                  const percentage = 80 - index * 15;
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{platform}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>任务状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: '未接收', count: tasks.filter(t => t.status === '未接收' || t.status === '未开始').length, color: 'bg-gray-500' },
                  { status: '已接收', count: tasks.filter(t => t.status === '已接收').length, color: 'bg-teal-500' },
                  { status: '进行中', count: tasks.filter(t => t.status === '进行中').length, color: 'bg-blue-500' },
                  { status: '已提交', count: tasks.filter(t => t.status === '已提交').length, color: 'bg-yellow-500' },
                  { status: '已审核', count: tasks.filter(t => t.status === '已审核').length, color: 'bg-green-500' },
                  { status: '未通过', count: tasks.filter(t => t.status === '未通过').length, color: 'bg-red-500' },
                ].map((item) => {
                  const percentage = tasks.length > 0 ? (item.count / tasks.length * 100) : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{item.status}</span>
                        <span className="text-sm font-medium">{item.count} 个</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
