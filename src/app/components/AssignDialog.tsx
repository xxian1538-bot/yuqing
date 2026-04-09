import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SentimentLevel } from "../types";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentimentId: string;
  sentimentLevel: SentimentLevel | string;
}

export function AssignDialog({ open, onOpenChange, sentimentId, sentimentLevel }: AssignDialogProps) {
  const [department, setDepartment] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleSubmit = () => {
    // 模拟提交
    alert(`舆情 ${sentimentId} 指派成功
需要审核后下发
执行部门: ${department}
处理人: ${assignee}
基于等级(${sentimentLevel})触发相应执行流程`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>指派任务</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm mb-4">
            当前舆情等级为 <strong>{sentimentLevel}</strong>，系统将自动触发相应的任务执行和审核流程。
          </div>
          <div className="space-y-2">
            <Label>选择执行部门</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dept1">新闻中心</SelectItem>
                <SelectItem value="dept2">公关部</SelectItem>
                <SelectItem value="dept3">法务部</SelectItem>
                <SelectItem value="dept4">客服中心</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>选择处理人员</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="请选择人员" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">负责专员A</SelectItem>
                <SelectItem value="user2">负责专员B</SelectItem>
                <SelectItem value="user3">组长C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">发起指派审核</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
