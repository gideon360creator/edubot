import { Filter } from 'lucide-react'

import type { Subject } from '@/hooks/api/subjects.api'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubjectFilterProps {
  value: string
  onChange: (value: string) => void
  subjects?: Array<Subject>
  label?: string
  className?: string
  selectTriggerClassName?: string
}

export function SubjectFilter({
  value,
  onChange,
  subjects,
  label = 'Filter by:',
  className,
  selectTriggerClassName,
}: SubjectFilterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-muted/50 rounded-lg border border-border shadow-sm flex-1 min-w-0',
        className,
      )}
    >
      <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
      {label ? (
        <span className="text-[11px] sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      ) : null}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            'h-7 sm:h-8 w-full border-none bg-transparent shadow-none focus:ring-0 text-xs sm:text-sm',
            selectTriggerClassName,
          )}
        >
          <SelectValue placeholder="All Subjects" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="all">All Subjects</SelectItem>
          {subjects?.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
