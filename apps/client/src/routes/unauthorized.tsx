import { Link, createFileRoute, useSearch } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || '/',
    reason: (search.reason as string) || undefined,
  }),
})

function UnauthorizedPage() {
  const { reason } = useSearch({ from: '/unauthorized' })

  const reasonMessages: Record<string, string> = {
    student_only: 'This page is only accessible to students.',
    lecturer_only: 'This page is only accessible to lecturers.',
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
          <CardDescription className="text-base text-gray-500 mt-2">
            {reason && reasonMessages[reason]
              ? reasonMessages[reason]
              : "You don't have permission to access this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-center text-sm text-muted-foreground">
          If you believe this is an error, please contact support or try signing
          in with a different account.
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button
            variant="default"
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          {/* <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Sign In with Another Account</Link>
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  )
}
