import { cn } from "@/app/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20":
              variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "bg-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
