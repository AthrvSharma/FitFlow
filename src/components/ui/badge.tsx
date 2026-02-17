import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "secondary";
}

const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-indigo-500/90 text-white",
  outline: "border border-indigo-200 text-indigo-600",
  success: "bg-emerald-500/90 text-white",
  warning: "bg-amber-500/90 text-white",
  secondary: "bg-slate-100 text-slate-700"
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", styles[variant], className)}
    {...props}
  />
));

Badge.displayName = "Badge";
