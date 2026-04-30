import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

export interface TargetOptionGroup {
  key: string;
  label: string;
  options: {
    id: string;
    label: string;
    description: string;
  }[];
}

interface TargetPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TargetOptionGroup[];
  selectedTargets: string[];
  onConfirm: (targetIds: string[]) => void;
}

export function TargetPickerDialog({
  open,
  onOpenChange,
  groups,
  selectedTargets,
  onConfirm,
}: TargetPickerDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedTargets);

  useEffect(() => {
    if (open) {
      setDraftSelection(selectedTargets);
    }
  }, [open, selectedTargets]);

  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    options: group.options.filter((option) => {
      const text = `${option.label}${option.description}${group.label}`.toLowerCase();
      return text.includes(keyword.toLowerCase());
    }),
  })).filter((group) => group.options.length > 0), [groups, keyword]);

  const toggle = (id: string, checked: boolean) => {
    setDraftSelection((prev) => (
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[72rem] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>选择处理对象</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索人员、角色、组织、职位"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            {draftSelection.length > 0 ? draftSelection.map((targetId) => {
              const option = groups.flatMap((group) => group.options).find((item) => item.id === targetId);
              if (!option) {
                return null;
              }
              return (
                <Badge key={targetId} variant="outline" className="bg-white">
                  {option.label}
                </Badge>
              );
            }) : (
              <span className="text-sm text-gray-500">尚未选择处理对象</span>
            )}
          </div>

          <div className="space-y-4">
            {visibleGroups.map((group) => (
              <div key={group.key} className="space-y-2 rounded-md border border-gray-200 p-4">
                <div className="text-sm font-medium text-gray-900">{group.label}</div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={draftSelection.includes(option.id)}
                        onCheckedChange={(checked) => toggle(option.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => {
            onConfirm(draftSelection);
            onOpenChange(false);
          }}>确认选择</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
