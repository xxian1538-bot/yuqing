import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function SystemConfig() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">系统配置</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基础设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">系统名称</Label>
              <Input id="systemName" defaultValue="舆情管理平台" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="orgName">组织名称</Label>
              <Input id="orgName" defaultValue="某某单位" className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>自动备份</Label>
                <p className="text-sm text-gray-600 mt-1">每日自动备份系统数据</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>数据统计</Label>
                <p className="text-sm text-gray-600 mt-1">启用数据统计和分析功能</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>舆情评分权重配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>涉及话题分类</Label>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="10" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>民众关注度</Label>
                <span className="text-sm font-medium">15%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="15" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>态度倾向</Label>
                <span className="text-sm font-medium">15%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="15" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>传播媒体扩散度</Label>
                <span className="text-sm font-medium">20%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="20" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>传播形式</Label>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="10" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>传播渠道</Label>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="10" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>账号影响力</Label>
                <span className="text-sm font-medium">20%</span>
              </div>
              <Input type="range" min="0" max="100" defaultValue="20" />
            </div>
            <Button>保存权重配置</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
