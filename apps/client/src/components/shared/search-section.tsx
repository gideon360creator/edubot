import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'

interface SearchSectionProps {
  placeholder?: string
  search: string
  onSearchChange: (value: string) => void
  badges?: ReactNode
  focusColorClass?: string
}

export function SearchSection({
  placeholder = 'Search...',
  search,
  onSearchChange,
  badges,
  focusColorClass = 'focus:ring-primary',
}: SearchSectionProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`pl-10 h-11 rounded-xl border-border ${focusColorClass} bg-background`}
        />
      </div>
      <div className="flex gap-2 text-sm text-muted-foreground items-center">
        {badges}
      </div>
    </div>
  )
}
