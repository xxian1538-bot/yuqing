import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDisposalTasks } from '../../data/mockData';

export function DisposalStatistics() {
  const tasks = mockDisposalTasks;

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">处置统计</h1>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">总处置任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{tasks.length}</div>
              <div className="text-sm text-gray-600 mt-2">
                较上月 +12.5%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">平均响应时间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">2.3<span className="text-lg">h</span></div>
              <div className="text-sm text-gray-600 mt-2">
                较上月 -15.2%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">任务完成率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {((tasks.filter(t => t.status === '已完结').length / tasks.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                较上月 +5.8%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>各等级处置情况</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['轻微', '一般', '较大', '重大', '特别重大'].map((level) => {
                const count = tasks.filter(t => t.level === level).length;
                const completed = tasks.filter(t => t.level === level && t.status === '已完结').length;
                const rate = count > 0 ? (completed / count * 100).toFixed(0) : 0;
                
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getLevelBadge(level)}
                        <span className="text-sm text-gray-600">
                          {count} 个任务，完成 {completed} 个
                        </span>
                      </div>
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${rate}%` }}
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
            <CardTitle>处置状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: '未开始', value: tasks.filter(t => t.status === '未开始').length },
                { name: '处置中', value: tasks.filter(t => t.status === '处置中').length },
                { name: '已完成', value: tasks.filter(t => t.status === '已完成').length },
                { name: '已完结', value: tasks.filter(t => t.status === '已完结').length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
