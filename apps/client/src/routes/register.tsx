import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { SignupForm } from '@/components/signup-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      if (context.auth.user?.role === 'lecturer') {
        throw redirect({ to: '/lecturer' })
      }
      throw redirect({ to: '/student' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 font-sans">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join the platform to start your learning journey
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <SignupForm role="student" />
            </TabsContent>
            <TabsContent value="lecturer">
              <SignupForm role="lecturer" />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>

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
