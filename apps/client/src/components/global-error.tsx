import { useState } from 'react'
import {
  AlertCircle,
  ChevronDown,
  RefreshCcw,
  Home,
  ShieldAlert,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function GlobalError({ error, reset }: ErrorComponentProps) {
  const [showStack, setShowStack] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-2xl w-full border-none shadow-2xl bg-background/50 backdrop-blur-xl rounded-4xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-destructive/5 via-transparent to-primary/5 pointer-events-none" />

        <CardContent className="pt-12 pb-10 px-8 flex flex-col items-center text-center relative z-10">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative h-20 w-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-4 border-background flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-foreground">
            Oops! Something snapped.
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
            We encountered an unexpected error while trying to render this page.
            Don't worry, even the best systems have hiccups.
          </p>

          <div className="w-full bg-muted/30 border border-muted/50 rounded-2xl p-4 mb-8 text-left group">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Precise Cause
              </span>
            </div>
            <code className="text-xs sm:text-sm font-mono text-destructive break-all block">
              {error.message || 'An unknown error occurred'}
            </code>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <Button
              onClick={() => reset()}
              size="lg"
              className="h-12 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/' })}
              className="h-12 px-8 rounded-2xl gap-2 font-bold border-muted-foreground/20 hover:bg-muted/50 hover:scale-[1.02] transition-all cursor-pointer shadow-none"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <Collapsible
            open={showStack}
            onOpenChange={setShowStack}
            className="w-full mt-10 text-left"
          >
            <div className="flex items-center justify-center">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 hover:text-foreground cursor-pointer rounded-full h-8 px-4"
                >
                  Technical Details
                  <ChevronDown
                    className={cn(
                      'ml-1 h-3 w-3 transition-transform',
                      showStack && 'rotate-180',
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-4">
              <div className="bg-zinc-950 rounded-2xl p-6 border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Stack Trace
                  </span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                  </div>
                </div>
                <pre className="text-[10px] sm:text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap custom-scrollbar max-h-48 leading-relaxed">
                  {error.stack || 'No stack trace available'}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <p className="fixed bottom-6 text-[10px] text-muted-foreground/30 font-mono tracking-tighter uppercase">
        ID: {Math.random().toString(36).substring(2, 9).toUpperCase()} • REF:
        ED-ERR-ROOT
      </p>
    </div>
  )
}
