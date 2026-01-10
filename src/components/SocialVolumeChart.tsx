import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

type SocialVolumeChartProps = {
  data: number[]
  labels: string[]
  height?: number
}

type Point = { label: string; volume: number }

export function SocialVolumeChart({ data, labels, height = 110 }: SocialVolumeChartProps) {
  const chartData: Point[] = (labels.length ? labels : data.map((_, i) => `T${i + 1}`)).map((label, i) => ({
    label,
    volume: data[i] ?? 0,
  }))

  const lastLabel = chartData[chartData.length - 1]?.label ?? "Now"
  const lastValue = chartData[chartData.length - 1]?.volume ?? 0
  const trend = chartData.length >= 2 ? chartData[chartData.length - 1].volume - chartData[0].volume : 0

  const trendColor = trend >= 0 ? "#10b981" : "#ef4444"

  const config: ChartConfig = {
    volume: {
      label: "Volume",
      color: trendColor,
    },
  }

  return (
    <div className="social-volume-chart">
      <div className="social-volume-label">
        Social volume, 7d ·{" "}
        <span style={{ color: trendColor }}>
          {lastLabel}: {lastValue}
        </span>
      </div>

      <ChartContainer
        config={config}
        className="w-full aspect-auto"
        style={{ height }}
      >
        <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="svArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={8}
          />
          <YAxis hide domain={["dataMin", "dataMax"]} />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelKey="label" nameKey="volume" indicator="line" />}
          />

          <Area
            type="monotone"
            dataKey="volume"
            stroke="var(--color-volume)"
            strokeWidth={2}
            fill="url(#svArea)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

