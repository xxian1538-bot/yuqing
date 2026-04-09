import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PerformanceManagement() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">绩效管理</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline">导出绩效报表</Button>
          </div>
          <div className="text-sm text-gray-600">
            统计周期：2026年3月
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { name: '网评员A', tasks: 5, completed: 4, posts: 45, approved: 42, rate: 93 },
          { name: '网评员B', tasks: 3, completed: 3, posts: 28, approved: 28, rate: 100 },
          { name: '网评员C', tasks: 6, completed: 5, posts: 52, approved: 48, rate: 92 },
        ].map((person, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{person.name}</CardTitle>
                <Badge className={
                  person.rate >= 95 ? 'bg-green-100 text-green-700' :
                  person.rate >= 90 ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }>
                  审核通过率 {person.rate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">接收任务</div>
                  <div className="text-2xl font-semibold">{person.tasks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">完成任务</div>
                  <div className="text-2xl font-semibold text-green-600">{person.completed}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">总发帖数</div>
                  <div className="text-2xl font-semibold text-blue-600">{person.posts}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">审核通过</div>
                  <div className="text-2xl font-semibold text-purple-600">{person.approved}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
