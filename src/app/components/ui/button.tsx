import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-blue-500/20 bg-gradient-to-r from-blue-600 to-cyan-500 text-primary-foreground shadow-[0_12px_26px_rgba(37,99,235,0.22)] hover:from-blue-500 hover:to-cyan-400 active:from-blue-700 active:to-blue-600",
        destructive:
          "bg-destructive text-white hover:bg-[#ff7875] active:bg-[#d9363e] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-slate-200/80 bg-white/70 text-slate-700 shadow-[0_8px_18px_rgba(32,97,165,0.06)] backdrop-blur-xl hover:border-blue-300 hover:bg-blue-50/75 hover:text-blue-700 active:border-blue-500 active:text-blue-800",
        secondary:
          "border border-blue-100 bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 active:bg-blue-100",
        ghost:
          "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700 active:bg-blue-100/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
