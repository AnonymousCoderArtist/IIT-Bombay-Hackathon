import { cn } from "@/lib/utils"

type ProgressRingProps = {
  value: number
  size?: number
  stroke?: number
  label?: string
  color?: string
  trackClassName?: string
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  color = "var(--primary)",
  trackClassName,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-muted", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-sm font-semibold tabular-nums">{label}</span>
      )}
    </div>
  )
}
