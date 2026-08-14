import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary shadow-card">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-heading tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
