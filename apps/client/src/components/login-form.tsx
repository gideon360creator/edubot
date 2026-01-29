import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuth } from '../auth'
import { useLoginMutation } from '../hooks/queries/user.queries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/login' })
  const { login } = useAuth()
  const { mutateAsync: loginAsync, isPending } = useLoginMutation()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const loginPromise = loginAsync({ identifier, password })

    toast.promise(loginPromise, {
      loading: 'Signing in to your account...',
      success: (data) => {
        login(data)

        // Redirect based on role if no specific redirect is requested
        if (redirect === '/') {
          if (data.user.role === 'lecturer') {
            navigate({ to: '/lecturer' })
          } else {
            navigate({ to: '/student' })
          }
        } else {
          navigate({ to: redirect })
        }

        return `Welcome back, ${data.user.username}`
      },
      error: (err: any) => {
        const backendError = err.response?.data
        return backendError?.message || 'Login failed'
      },
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Login to your account</CardTitle>
          <CardDescription>
            Enter your username or matriculation number below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">
                  Username / Matriculation Number
                </FieldLabel>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Logging In...' : 'Login'}
                </Button>
                {/* <Button variant="outline" type="button" className="w-full">
                  Login with Google
                </Button> */}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
