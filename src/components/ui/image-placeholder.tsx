import type { LucideIcon } from "lucide-react";
import { cn, getInitials, hueFromString } from "@/lib/utils";

/**
 * Elegant stand-in when a vendor or wedding has no photo: a soft tinted
 * gradient (hue derived from the name) with a monogram and category icon.
 */
export function ImagePlaceholder({
  name,
  hue,
  icon: Icon,
  className,
  size = "md",
}: {
  name: string;
  hue?: number;
  icon?: LucideIcon;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const h = hue ?? hueFromString(name);
  return (
    <div
      className={cn("bg-tint relative flex size-full items-center justify-center overflow-hidden", className)}
      style={{ "--h": h } as React.CSSProperties}
      role="img"
      aria-label={name}
    >
      <div className="bg-dots absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-screen dark:opacity-20" aria-hidden />
      <svg
        className="text-tint absolute -right-8 -top-8 size-40 opacity-25"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden
      >
        <circle cx="38" cy="55" r="26" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="62" cy="55" r="26" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="text-tint relative flex flex-col items-center gap-2">
        {Icon && size !== "sm" && <Icon className={cn("opacity-70", size === "lg" ? "size-7" : "size-5")} strokeWidth={1.5} />}
        <span
          className={cn(
            "font-display italic leading-none",
            size === "sm" ? "text-lg" : size === "lg" ? "text-6xl" : "text-4xl"
          )}
        >
          {getInitials(name)}
        </span>
      </div>
    </div>
  );
}
