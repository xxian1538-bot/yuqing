import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function ApiConfig() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">API对接</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>华龙网数据对接</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiUrl">API地址</Label>
            <Input 
              id="apiUrl" 
              defaultValue="https://api.cqnews.net/sentiment/v1" 
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="apiKey">API密钥</Label>
            <Input 
              id="apiKey" 
              type="password"
              defaultValue="************************" 
              className="mt-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>自动同步</Label>
              <p className="text-sm text-gray-600 mt-1">实时接收华龙网推送的舆情数据</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex gap-3">
            <Button>测试连接</Button>
            <Button variant="outline">保存配置</Button>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">连接状态</span>
              <span className="text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                已连接
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">最后同步时间</span>
              <span className="text-gray-700">2026-03-24 19:52:40</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">本月接收数据</span>
              <span className="text-gray-700">156 条</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
