import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import type { ScoringWeights } from '../../types';
import { useScoringConfig } from '../../context/ScoringConfigContext';

export function SystemConfig() {
  const { weights, updateWeights } = useScoringConfig();
  const [draftWeights, setDraftWeights] = useState<ScoringWeights>(weights);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setDraftWeights(weights);
  }, [weights]);

  const weightFields: Array<{ key: keyof ScoringWeights; label: string }> = [
    { key: 'topicWeight', label: '涉及话题分类' },
    { key: 'attentionWeight', label: '民众关注度' },
    { key: 'emotionWeight', label: '态度倾向' },
    { key: 'mediaWeight', label: '传播媒体扩散度' },
    { key: 'formatWeight', label: '传播形式' },
    { key: 'channelWeight', label: '传播渠道' },
    { key: 'influenceWeight', label: '账号影响力' },
  ];

  const totalWeight = Object.values(draftWeights).reduce((sum, value) => sum + value, 0);

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>舆情评分权重配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weightFields.map((field) => (
              <div key={field.key}>
                <div className="mb-2 flex items-center justify-between">
                  <Label>{field.label}</Label>
                  <span className="text-sm font-medium">{draftWeights[field.key]}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={draftWeights[field.key]}
                  onChange={(e) => {
                    setDraftWeights({ ...draftWeights, [field.key]: Number(e.target.value) });
                    setSaveMessage('');
                  }}
                />
              </div>
            ))}
            <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
              当前总权重：{totalWeight}%。
              保存后仅影响后续新增舆情事件的自动评级，不影响历史舆情事件的既有等级。
            </div>
            {saveMessage ? <div className="text-sm text-green-600">{saveMessage}</div> : null}
            <Button
              onClick={() => {
                updateWeights(draftWeights);
                setSaveMessage('权重配置已保存，后续新增舆情事件将按新权重计算。');
              }}
            >
              保存权重配置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
