import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import type { ScoringMaxScores, ScoringWeights } from '../../types';
import { useScoringConfig } from '../../context/ScoringConfigContext';

export function SystemConfig() {
  const { weights, maxScores, updateConfig } = useScoringConfig();
  const [draftWeights, setDraftWeights] = useState<ScoringWeights>(weights);
  const [draftMaxScores, setDraftMaxScores] = useState<ScoringMaxScores>(maxScores);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setDraftWeights(weights);
    setDraftMaxScores(maxScores);
  }, [maxScores, weights]);

  const scoringFields: Array<{ weightKey: keyof ScoringWeights; maxScoreKey: keyof ScoringMaxScores; label: string }> = [
    { weightKey: 'topicWeight', maxScoreKey: 'topicMaxScore', label: '涉及话题分类' },
    { weightKey: 'attentionWeight', maxScoreKey: 'attentionMaxScore', label: '民众关注度' },
    { weightKey: 'emotionWeight', maxScoreKey: 'emotionMaxScore', label: '态度倾向' },
    { weightKey: 'mediaWeight', maxScoreKey: 'mediaMaxScore', label: '传播媒体扩散度' },
    { weightKey: 'formatWeight', maxScoreKey: 'formatMaxScore', label: '传播形式' },
    { weightKey: 'channelWeight', maxScoreKey: 'channelMaxScore', label: '传播渠道' },
    { weightKey: 'influenceWeight', maxScoreKey: 'influenceMaxScore', label: '账号影响力' },
  ];

  const totalWeight = Object.values(draftWeights).reduce((sum, value) => sum + value, 0);
  const canSave = totalWeight === 100 && Object.values(draftMaxScores).every((value) => value > 0);

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
            {scoringFields.map((field) => (
              <div key={field.weightKey} className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label>{field.label}</Label>
                  <span className="text-sm font-medium">{draftWeights[field.weightKey]}%</span>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={draftWeights[field.weightKey]}
                    onChange={(e) => {
                      setDraftWeights({ ...draftWeights, [field.weightKey]: Number(e.target.value) });
                      setSaveMessage('');
                      setErrorMessage('');
                    }}
                  />
                  <div>
                    <Label className="text-xs text-gray-500">评分项总分</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={draftMaxScores[field.maxScoreKey]}
                      onChange={(e) => {
                        setDraftMaxScores({ ...draftMaxScores, [field.maxScoreKey]: Number(e.target.value) || 0 });
                        setSaveMessage('');
                        setErrorMessage('');
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className={totalWeight === 100 ? 'rounded-md bg-green-50 px-4 py-3 text-sm text-green-700' : 'rounded-md bg-red-50 px-4 py-3 text-sm text-red-700'}>
              当前总权重：{totalWeight}%。必须等于 100% 才能保存。
              保存后仅影响后续新增舆情事件的自动评级，不影响历史舆情事件的既有等级。
            </div>
            {saveMessage ? <div className="text-sm text-green-600">{saveMessage}</div> : null}
            {errorMessage ? <div className="text-sm text-red-600">{errorMessage}</div> : null}
            <Button
              disabled={!canSave}
              onClick={() => {
                if (totalWeight !== 100) {
                  setErrorMessage('权重总和必须等于 100%。');
                  return;
                }
                if (Object.values(draftMaxScores).some((value) => value <= 0)) {
                  setErrorMessage('每个评分项总分必须大于 0。');
                  return;
                }
                updateConfig({ weights: draftWeights, maxScores: draftMaxScores });
                setSaveMessage('评分规则已保存，后续新增舆情事件将按新规则计算。');
                setErrorMessage('');
              }}
            >
              保存评分规则
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
