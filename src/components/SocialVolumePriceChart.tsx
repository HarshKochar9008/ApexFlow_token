import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type SocialVolumePriceChartProps = {
  data: Array<{ label: string; volume: number; price: number }>
  height?: number
  syncId?: string
}

export function SocialVolumePriceChart({
  data,
  height = 140,
  syncId,
}: SocialVolumePriceChartProps) {
  const config: ChartConfig = {
    volume: { label: "Social Volume", color: "rgba(200, 240, 46, 0.9)" },
    price: { label: "Price", color: "rgba(59, 130, 246, 0.95)" },
  }

  return (
    <ChartContainer config={config} className="w-full" style={{ height }}>
      <ComposedChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }} syncId={syncId}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />

        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
        />

        <YAxis yAxisId="volume" hide domain={["dataMin", "dataMax"]} />
        <YAxis yAxisId="price" orientation="right" hide domain={["dataMin", "dataMax"]} />

        <ChartTooltip
          cursor
          content={
            <ChartTooltipContent
              labelKey="label"
              indicator="line"
            />
          }
        />

        <Bar
          yAxisId="volume"
          dataKey="volume"
          fill="var(--color-volume)"
          radius={[4, 4, 0, 0]}
          opacity={0.7}
        />

        <Line
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

