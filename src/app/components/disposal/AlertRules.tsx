import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { AlertRuleDialog } from './AlertRuleDialog';
import { AlertRule } from '../../types';
import { mockAlertRules } from '../../data/mockData';

export function AlertRules() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const handleSaveRule = (rule: AlertRule) => {
    if (editingRule) {
      setAlertRules(alertRules.map(r => r.id === rule.id ? rule : r));
    } else {
      setAlertRules([rule, ...alertRules]);
    }
  };

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
        <h1 className="text-2xl font-semibold mb-2">预警规则</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingRule(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              新建规则
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            共 {alertRules.length} 条规则，
            已启用 {alertRules.filter(r => r.enabled).length} 条
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alertRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    {getLevelBadge(rule.level)}
                    <Badge className={rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {rule.enabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    预警阈值：{rule.threshold}分 | 响应时限：{rule.responseTime}小时
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.enabled} onCheckedChange={(checked) => handleSaveRule({...rule, enabled: checked})} />
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingRule(rule);
                    setIsDialogOpen(true);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAlertRules(alertRules.filter(r => r.id !== rule.id))}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-2">通知对象</div>
                  <div className="flex flex-wrap gap-2">
                    {rule.targets.map((target, index) => (
                      <Badge key={index} variant="outline">{target}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertRuleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rule={editingRule}
        onSave={handleSaveRule}
      />
    </div>
  );
}
