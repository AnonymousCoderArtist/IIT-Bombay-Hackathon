import { Badge } from "@/components/ui/badge"

const STATUS_VARIANTS: Record<string, "success" | "warning" | "destructive" | "info" | "violet" | "secondary" | "outline"> = {
  present: "success",
  completed: "success",
  active: "success",
  approved: "success",
  accepted: "success",
  open: "success",
  live: "success",
  enabled: "success",
  paid: "success",
  ongoing: "info",
  pending: "warning",
  upcoming: "warning",
  applied: "info",
  late: "warning",
  draft: "secondary",
  inactive: "secondary",
  disabled: "secondary",
  absent: "destructive",
  rejected: "destructive",
  closed: "destructive",
  failed: "destructive",
  cancelled: "destructive",
  expired: "destructive",
  shortlisted: "violet",
  inreview: "violet",
  interview: "violet",
}

export function StatusBadge({ status }: { status?: string | null }) {
  const key = (status ?? "").toLowerCase().replace(/[_\s]/g, "");
  const variant = STATUS_VARIANTS[key] ?? "secondary";
  return <Badge variant={variant}>{status}</Badge>
}
