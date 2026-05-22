import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function UserManagement() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">用户管理</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户列表</CardTitle>
            <Button>添加用户</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: '舆情管理员', role: '管理员', email: 'admin@system.com', status: '启用' },
              { name: '张三', role: '业务负责人', email: 'zhangsan@system.com', status: '启用' },
              { name: '李四', role: '业务负责人', email: 'lisi@system.com', status: '启用' },
              { name: '网评员A', role: '网评人员', email: 'wangping@system.com', status: '启用' },
              { name: '网评员B', role: '网评人员', email: 'wangpingb@system.com', status: '启用' },
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{user.role}</span>
                  <span className="text-sm text-green-600">{user.status}</span>
                  <Button variant="ghost" size="sm">编辑</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
