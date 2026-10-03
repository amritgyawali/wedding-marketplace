import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-primary-soft text-primary-soft-foreground",
  gold: "bg-accent-soft text-accent-soft-foreground",
  sage: "bg-success-soft text-success-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  tone = "brand",
  href,
  className,
  children,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  tone?: keyof typeof TONES;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex size-11 items-center justify-center rounded-2xl", TONES[tone])}>
          <Icon className="size-5" strokeWidth={1.9} />
        </div>
        {href ? (
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
        ) : trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive ? "bg-success-soft text-success-soft-foreground" : "bg-destructive-soft text-destructive-soft-foreground"
            )}
          >
            {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-medium tracking-tight tabular-nums">{value}</p>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
      {children}
    </>
  );

  const classes = cn(
    "group relative block rounded-3xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300",
    href && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
    className
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
