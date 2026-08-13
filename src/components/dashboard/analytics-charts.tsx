"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const AXIS = { stroke: "var(--muted-foreground)", fontSize: 12 } as const;
const GRID = { strokeDasharray: "3 3", stroke: "var(--border)" } as const;

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-elevated)",
} as const;

type ChartData = {
  attendanceTrend?: { month: string; percentage: number }[];
  departmentPerformance?: { name: string; percentage: number }[];
  placementStats?: { name: string; value: number }[];
  eventParticipation?: { name: string; value: number }[];
};

export function AnalyticsCharts({ data }: { data: Record<string, unknown> }) {
  const charts = data as unknown as ChartData;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.attendanceTrend ?? []}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="month" {...AXIS} tickLine={false} axisLine={false} />
                <YAxis {...AXIS} unit="%" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ stroke: "var(--border-strong)" }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="Attendance %"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#att)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentPerformance ?? []}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="name" {...AXIS} tickLine={false} axisLine={false} />
                <YAxis {...AXIS} unit="%" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "color-mix(in oklch, var(--muted) 50%, transparent)" }}
                />
                <Bar
                  dataKey="percentage"
                  name="Attendance %"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Placement applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.placementStats ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {(charts.placementStats ?? []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "color-mix(in oklch, var(--muted) 50%, transparent)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top events by registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.eventParticipation ?? []} layout="vertical">
                <CartesianGrid {...GRID} />
                <XAxis type="number" {...AXIS} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...AXIS}
                  width={110}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "color-mix(in oklch, var(--muted) 50%, transparent)" }}
                />
                <Bar
                  dataKey="value"
                  name="Registrations"
                  fill="var(--chart-2)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
