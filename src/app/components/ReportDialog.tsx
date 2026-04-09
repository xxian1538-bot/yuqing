import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "\./ui/dialog";
import { Button } from "\./ui/button";
import { Label } from "\./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "\./ui/select";
import { Input } from "\./ui/input";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentId: string;
  onSuccess?: () => void;
}

export function ReportDialog({ open, onOpenChange, sentimentId, onSuccess }: ReportDialogProps) {
  const [targetType, setTargetType] = useState("person");
  const [target, setTarget] = useState("");

  const handleSubmit = () => {
    if (!target) {
      alert("请选择报送目标");
      return;
    }
    
    // 调用成功回调以更新列表状态
    if (onSuccess) {
      onSuccess();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>舆情报送</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>报送目标类型</Label>
            <Select value={targetType} onValueChange={(val) => { setTargetType(val); setTarget(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="请选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">人员</SelectItem>
                <SelectItem value="role">角色</SelectItem>
                <SelectItem value="org">组织</SelectItem>
                <SelectItem value="position">职位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>选择报送目标</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
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
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">确定报送</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
