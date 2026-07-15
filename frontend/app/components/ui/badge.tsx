import { cn } from "@/app/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          {
            "bg-muted text-muted-foreground": variant === "default",
            "bg-emerald-500/20 text-emerald-400": variant === "success",
            "bg-amber-500/20 text-amber-400": variant === "warning",
            "bg-red-500/20 text-red-400": variant === "danger",
            "bg-blue-500/20 text-blue-400": variant === "info",
            "bg-purple-500/20 text-purple-400": variant === "purple",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
