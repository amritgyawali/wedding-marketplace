import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/70 hover:border-foreground/20 focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type, ...props }: InputProps) {
  return <input type={type} className={cn(fieldClass, "h-11", className)} {...props} />;
}

/** Input with a leading icon; the icon is decorative. */
function InputWithIcon({
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}: InputProps & {
  icon: React.ComponentType<{ className?: string }>;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-10", className)} {...props} />
    </div>
  );
}

export { Input, InputWithIcon };
