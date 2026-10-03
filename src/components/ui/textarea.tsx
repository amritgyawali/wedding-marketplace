import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/components/ui/input";

export type TextareaProps = React.ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-24 resize-y py-3 leading-relaxed [field-sizing:content]", className)}
      {...props}
    />
  );
}

export { Textarea };
