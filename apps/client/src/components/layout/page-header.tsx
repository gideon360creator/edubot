import * as React from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  iconColorClass?: string
  bgIconColorClass?: string
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  iconColorClass = 'text-primary',
  bgIconColorClass = 'bg-primary/10',
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${bgIconColorClass} ${iconColorClass}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      </div>
      {action && <div className="w-full md:w-auto mt-2 md:mt-0">{action}</div>}
    </motion.div>
  )
}
