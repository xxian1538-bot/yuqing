import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { AlertRule, SentimentLevel } from "../../types";
import { Plus, X } from "lucide-react";

interface AlertRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AlertRule | null;
  onSave: (rule: AlertRule) => void;
}

export function AlertRuleDialog({ open, onOpenChange, rule, onSave }: AlertRuleDialogProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SentimentLevel>("一般");
  const [threshold, setThreshold] = useState("60");
  const [responseTime, setResponseTime] = useState("24");
  const [enabled, setEnabled] = useState(true);
  
  // Notification Targets State
  const [targets, setTargets] = useState<string[]>([]);
  const [targetType, setTargetType] = useState("person");
  const [selectedTarget, setSelectedTarget] = useState("");

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setLevel(rule.level);
      setThreshold(rule.threshold.toString());
      setResponseTime(rule.responseTime.toString());
      setEnabled(rule.enabled);
      setTargets([...rule.targets]);
    } else {
      setName("");
      setLevel("一般");
      setThreshold("60");
      setResponseTime("24");
      setEnabled(true);
      setTargets([]);
    }
    // reset selection dropdowns
    setTargetType("person");
    setSelectedTarget("");
  }, [rule, open]);

  const handleAddTarget = () => {
    if (!selectedTarget) return;
    
    // Convert the raw value to a readable label for simplicity
    const labels: Record<string, string> = {
      user1: "张三 (用户)", user2: "李四 (用户)", user3: "王五 (用户)",
      admin: "管理员 (角色)", editor: "编辑 (角色)", auditor: "审核员 (角色)",
      prop: "宣传部 (组织)", net: "网信办 (组织)", police: "公安局 (组织)",
      director: "主任 (职位)", manager: "经理 (职位)", staff: "职员 (职位)"
    };
    
    const targetLabel = labels[selectedTarget] || selectedTarget;
    if (!targets.includes(targetLabel)) {
      setTargets([...targets, targetLabel]);
    }
    setSelectedTarget("");
  };

  const handleRemoveTarget = (targetToRemove: string) => {
    setTargets(targets.filter(t => t !== targetToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("请输入规则名称");
      return;
    }

    const newRule: AlertRule = {
      id: rule ? rule.id : String(Date.now()),
      name,
      level,
      threshold: parseInt(threshold) || 0,
      responseTime: parseInt(responseTime) || 0,
      enabled,
      targets,
      createdAt: rule ? rule.createdAt : new Date().toLocaleString(),
      conditions: rule ? rule.conditions : {
        topicWeight: 10,
        attentionWeight: 15,
        emotionWeight: 15,
        mediaWeight: 20,
        formatWeight: 10,
        channelWeight: 10,
        influenceWeight: 20
      }
    };

    onSave(newRule);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[72rem] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "编辑预警规则" : "新建预警规则"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>规则名称</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="输入规则名称" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>舆情事件等级</Label>
              <Select value={level} onValueChange={(v: SentimentLevel) => setLevel(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="轻微">轻微</SelectItem>
                  <SelectItem value="一般">一般</SelectItem>
                  <SelectItem value="较大">较大</SelectItem>
                  <SelectItem value="重大">重大</SelectItem>
                  <SelectItem value="特别重大">特别重大</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>预警阈值 (分)</Label>
              <Input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>响应时限要求 (小时)</Label>
              <Input type="number" value={responseTime} onChange={e => setResponseTime(e.target.value)} />
            </div>

            <div className="space-y-2 flex flex-col justify-center mt-6">
              <div className="flex items-center gap-2">
                <Switch checked={enabled} onCheckedChange={setEnabled} id="enable-switch" />
                <Label htmlFor="enable-switch" className="cursor-pointer">{enabled ? "已启用" : "已禁用"}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">通知对象配置</Label>
            
            <div className="flex gap-2">
              <Select value={targetType} onValueChange={(val) => { setTargetType(val); setSelectedTarget(""); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">用户</SelectItem>
                  <SelectItem value="role">角色</SelectItem>
                  <SelectItem value="org">组织</SelectItem>
                  <SelectItem value="position">职位</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择通知对象" />
                </SelectTrigger>
                <SelectContent>
                  {targetType === "person" && (
                    <>
                      <SelectItem value="user1">张三</SelectItem>
                      <SelectItem value="user2">李四</SelectItem>
                      <SelectItem value="user3">王五</SelectItem>
                    </>
                  )}
                  {targetType === "role" && (
                    <>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="editor">编辑</SelectItem>
                      <SelectItem value="auditor">审核员</SelectItem>
                    </>
                  )}
                  {targetType === "org" && (
                    <>
                      <SelectItem value="prop">宣传部</SelectItem>
                      <SelectItem value="net">网信办</SelectItem>
                      <SelectItem value="police">公安局</SelectItem>
                    </>
                  )}
                  {targetType === "position" && (
                    <>
                      <SelectItem value="director">主任</SelectItem>
                      <SelectItem value="manager">经理</SelectItem>
                      <SelectItem value="staff">职员</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Button type="button" onClick={handleAddTarget} variant="outline" className="px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="min-h-[80px] p-3 border rounded-md bg-gray-50 flex flex-wrap gap-2 items-start">
              {targets.length === 0 ? (
                <span className="text-sm text-gray-400">暂无通知对象，请在上方添加</span>
              ) : (
                targets.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 pr-1">
                    {t}
                    <button onClick={() => handleRemoveTarget(t)} className="p-0.5 rounded-full hover:bg-blue-300">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
            保存规则
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
