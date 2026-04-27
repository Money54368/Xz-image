import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-32 w-full rounded-[24px] border bg-white/90 px-4 py-3 text-base leading-7 shadow-sm outline-none select-text focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      {...props}
    />
  );
}

export { Textarea };
