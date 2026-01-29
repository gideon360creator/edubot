import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  isLoading?: boolean
  colorClass?: string
  bgIconColorClass?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  isLoading,
  colorClass = 'text-primary',
  bgIconColorClass = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-md ${bgIconColorClass} p-2 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}
