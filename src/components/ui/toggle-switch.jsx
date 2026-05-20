import * as React from "react";
import { cn } from "@/lib/utils";

const ToggleSwitch = React.forwardRef(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[#0d9488]" : "bg-zinc-300",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform absolute top-0.5",
            checked ? "left-[22px]" : "left-[2px]",
          )}
        />
      </button>
    );
  },
);
ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
