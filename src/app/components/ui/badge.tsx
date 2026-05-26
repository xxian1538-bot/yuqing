import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-75",
  {
    variants: {
      variant: {
        default:
          "border-blue-200/65 bg-blue-50/85 text-primary [a&]:hover:bg-[#d6e4ff]",
        secondary:
          "border-slate-200/70 bg-slate-100/80 text-slate-600 [a&]:hover:bg-[#f0f0f0]",
        destructive:
          "border-rose-200/70 bg-rose-50/90 text-destructive [a&]:hover:bg-[#ffccc7] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-slate-200/80 bg-white/60 text-slate-600 [a&]:hover:border-primary [a&]:hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
