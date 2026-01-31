import { Link } from '@tanstack/react-router'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/auth'

export function NotFound() {
  const { isAuthenticated, user } = useAuth()
  const dashboardLink = user?.role === 'lecturer' ? '/lecturer' : '/student'

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-2xl w-full border-none shadow-2xl bg-background/50 backdrop-blur-xl rounded-4xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <CardContent className="pt-12 pb-10 px-8 flex flex-col items-center text-center relative z-10">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileQuestion className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-foreground">
            Lost in Cyberspace?
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
            The page you're looking for has vanished or never existed. Let's get
            you back on track.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            {isAuthenticated ? (
              <Link to={dashboardLink}>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="h-12 px-8 rounded-2xl gap-2 font-bold border-muted-foreground/20 hover:bg-muted/50 hover:scale-[1.02] transition-all cursor-pointer shadow-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="fixed bottom-6 text-[10px] text-muted-foreground/30 font-mono tracking-tighter uppercase">
        Error 404 • Path: {window.location.pathname}
      </p>
    </div>
  )
}
