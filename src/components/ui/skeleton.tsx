import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60 before:absolute before:inset-0 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/8",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
