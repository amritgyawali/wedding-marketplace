import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden className={cn("skeleton-shimmer rounded-xl", className)} {...props} />;
}

export { Skeleton };
