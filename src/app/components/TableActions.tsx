import type { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

interface TableActionsProps {
  actions: ReactNode[];
}

export function TableActions({ actions }: TableActionsProps) {
  const visibleActions = actions.slice(0, 2);
  const overflowActions = actions.slice(2);

  return (
    <div className="flex items-center justify-end gap-1">
      {visibleActions.map((action, index) => (
        <span key={`visible-${index}`} className="inline-flex">
          {action}
        </span>
      ))}

      {overflowActions.length > 0 ? (
        <details className="group relative inline-flex">
          <summary className="list-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-blue-50/80 hover:text-blue-700">
              <MoreVertical className="h-4 w-4" />
            </span>
          </summary>
          <div className="absolute right-0 top-full z-[9999] mt-2 hidden w-32 rounded-md border border-slate-200 bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.16)] group-hover:block group-open:block">
            <div className="flex flex-col items-stretch gap-1">
              {overflowActions.map((action, index) => (
                <span key={`overflow-${index}`} className="flex justify-stretch [&_[data-slot=button]]:w-full [&_[data-slot=button]]:justify-start">
                  {action}
                </span>
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
}
