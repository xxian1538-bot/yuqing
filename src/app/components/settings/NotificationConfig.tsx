import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function NotificationConfig() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">通知设置</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>短信通知配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="smsProvider">短信服务商</Label>
              <Input id="smsProvider" defaultValue="阿里云短信" className="mt-2" disabled />
            </div>
            <div>
              <Label htmlFor="smsKey">AccessKey</Label>
              <Input 
                id="smsKey" 
                type="password"
                defaultValue="************************" 
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="smsSecret">AccessSecret</Label>
              <Input 
                id="smsSecret" 
                type="password"
                defaultValue="************************" 
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>启用短信通知</Label>
                <p className="text-sm text-gray-600 mt-1">重要舆情自动发送短信通知</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>保存配置</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>通知规则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>特别重大舆情短信通知</Label>
                <p className="text-sm text-gray-600 mt-1">特别重大舆情触发时发送短信</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>重大舆情短信通知</Label>
                <p className="text-sm text-gray-600 mt-1">重大舆情触发时发送短信</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>任务超时提醒</Label>
                <p className="text-sm text-gray-600 mt-1">处置任务超时发送提醒</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>每日汇总报告</Label>
                <p className="text-sm text-gray-600 mt-1">每日推送舆情汇总报告</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
