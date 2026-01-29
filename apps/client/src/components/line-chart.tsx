import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const title = 'Performance Trend Area Chart'

interface ChartLineDotsProps {
  data: any[]
  config: ChartConfig
  xDataKey?: string
  lineDataKey?: string
}

const ChartLineDots = ({
  data,
  config,
  xDataKey = 'date',
  lineDataKey = 'score',
}: ChartLineDotsProps) => (
  <div className="h-full w-full">
    <ChartContainer config={config} className="h-full w-full aspect-auto">
      <AreaChart
        data={data}
        margin={{
          left: 0,
          right: 20,
          top: 10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={`var(--color-${lineDataKey})`}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={`var(--color-${lineDataKey})`}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey={xDataKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
        />
        <YAxis domain={[0, 100]} hide />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value, payload) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  return `${data.assessment} (${data.fullDate})`
                }
                return value
              }}
            />
          }
        />
        <Area
          dataKey={lineDataKey}
          type="monotone"
          fill="url(#fillScore)"
          fillOpacity={1}
          stroke={`var(--color-${lineDataKey})`}
          strokeWidth={3}
          activeDot={{
            r: 6,
            style: { fill: `var(--color-${lineDataKey})`, opacity: 0.9 },
          }}
        />
      </AreaChart>
    </ChartContainer>
  </div>
)

export default ChartLineDots
