import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      if (context.auth.user?.role === 'lecturer') {
        throw redirect({ to: '/lecturer' })
      }
      throw redirect({ to: '/student' })
    }
  },
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || '/',
  }),
})

function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 font-sans">
            EduBot
          </h1>
          <p className="text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Register here
          </Link>
        </div>

        {/* <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-muted-foreground text-sm hover:underline"
          >
            ← Back to Home
          </Link>
        </div> */}
      </div>
    </div>
  )
}
