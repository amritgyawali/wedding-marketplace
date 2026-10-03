import Link from "next/link";
import { cn } from "@/lib/utils";

/** Interlocking-rings mark on a rosewood tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-[70%]" fill="none">
        <circle cx="12.5" cy="17.5" r="6.5" stroke="white" strokeWidth="2.2" />
        <circle cx="19.5" cy="17.5" r="6.5" stroke="white" strokeOpacity="0.8" strokeWidth="2.2" />
        <path d="M19.5 6.2 21.6 8.6 19.5 11 17.4 8.6Z" fill="oklch(0.86 0.08 80)" />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  tone = "default",
  subtitle,
}: {
  href?: string;
  className?: string;
  tone?: "default" | "light";
  subtitle?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="WedMarket home">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-foreground"
          )}
        >
          Wed<span className={cn("italic font-normal", tone === "light" ? "text-champagne-300" : "text-primary")}>market</span>
        </span>
        {subtitle && (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              tone === "light" ? "text-white/60" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
