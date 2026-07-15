import { cn } from "@/app/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-foreground/80"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
