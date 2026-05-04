import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        className,
      )}
    />
  );
}
