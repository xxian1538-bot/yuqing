import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-border placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[#1677ff]/15 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-[6px] border bg-input-background px-3 py-2 text-base transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#bfbfbf] md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
