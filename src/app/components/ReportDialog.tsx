import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "\./ui/dialog";
import { Button } from "\./ui/button";
import { Label } from "\./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "\./ui/select";
import { Textarea } from "./ui/textarea";
import { useSentimentData } from "../context/SentimentDataContext";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentIds: string[];
  onSuccess?: (sentimentIds: string[]) => void;
}

export function ReportDialog({ open, onOpenChange, sentimentIds, onSuccess }: ReportDialogProps) {
  const { reportSentiments } = useSentimentData();
  const [targetType, setTargetType] = useState("person");
  const [target, setTarget] = useState("");
  const [reportNote, setReportNote] = useState("");
  const isBatch = sentimentIds.length > 1;

  const handleSubmit = () => {
    if (!target) {
      alert("请选择报送目标");
      return;
    }

    reportSentiments({
      sentimentIds,
      targetType,
      target,
      reportNote,
    });

    if (onSuccess) {
      onSuccess(sentimentIds);
    }
    
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setTargetType("person");
      setTarget("");
      setReportNote("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[42rem] bg-white">
        <DialogHeader>
          <DialogTitle>{isBatch ? '批量舆情报送' : '舆情报送'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            {isBatch ? `当前已选择 ${sentimentIds.length} 条舆情进行统一报送。` : `当前报送舆情编号：${sentimentIds[0] || '-'}`}
          </div>
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
          <div className="space-y-2">
            <Label>报送说明</Label>
            <Textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              className="min-h-24"
              placeholder="请输入本次报送的说明、背景或需要重点关注的信息"
            />
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
