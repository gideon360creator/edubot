import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  onClear?: () => void
  clearText?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  onClear,
  clearText = 'Clear Search',
}: EmptyStateProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-[400px] flex-col items-center justify-center gap-4 text-center rounded-3xl border-2 border-dashed border-border bg-muted/50"
      >
        <div className="p-4 rounded-full bg-accent">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-1 px-4">
          <p className="text-xl font-semibold">{title}</p>
          {description && (
            <p className="text-muted-foreground max-w-xs">{description}</p>
          )}
        </div>
        {onClear && (
          <Button
            variant="outline"
            onClick={onClear}
            className="mt-2 rounded-full px-6"
          >
            {clearText}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
