import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { DisposalTask } from "../../types";

interface HandleDisposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DisposalTask | null;
  onSubmit: (details: string, attachment: string) => void;
}

export function HandleDisposalDialog({ open, onOpenChange, task, onSubmit }: HandleDisposalProps) {
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState("");

  const handleSubmit = () => {
    onSubmit(details, attachment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[56rem] bg-white">
        <DialogHeader>
          <DialogTitle>提交处置信息</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>处置详情描述</Label>
            <Input 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              placeholder="请输入处置的具体措施和情况..." 
            />
          </div>
          <div className="space-y-2">
            <Label>附件上传 (图片/视频/文档)</Label>
            <Input 
              type="file" 
              onChange={e => setAttachment("已上传文件")} 
            />
            {attachment && <p className="text-xs text-green-600 mt-1">{attachment}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">提交处置</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
