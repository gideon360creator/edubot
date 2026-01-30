import * as React from 'react'
import { ArrowUpIcon, Loader2 } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface AIInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  isPending?: boolean
  isStreaming?: boolean
  placeholder?: string
  className?: string
}

export function AIInput({
  value,
  onChange,
  onSend,
  isPending,
  isStreaming,
  placeholder = 'Ask, Search or Chat...',
  className,
}: AIInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(value)
    }
  }

  const isLoading = isPending || isStreaming

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <InputGroup className="bg-muted/40 border rounded-xl focus-within:ring-0 focus-within:border-muted-foreground/30 transition-all shadow-none">
        <InputGroupTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[200px] py-2.5 px-4 text-sm focus-visible:ring-0 placeholder:text-xs"
        />
        <InputGroupAddon align="inline-end" className="px-3">
          <InputGroupButton
            className="rounded-full h-7 w-7 bg-primary/90 hover:bg-primary shadow-sm transition-all text-primary-foreground cursor-pointer"
            disabled={!value.trim() || isLoading}
            size="icon-xs"
            variant="default"
            onClick={() => onSend(value)}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
