import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-card/60 text-center",
        compact ? "px-6 py-10" : "px-6 py-16 sm:py-20",
        className
      )}
    >
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground shadow-soft ring-8 ring-primary-soft/40">
        <Icon className="size-7" strokeWidth={1.75} />
      </div>
      <h3 className="relative font-display text-xl font-medium tracking-tight">{title}</h3>
      {description && (
        <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
