import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

import { useSignupMutation } from '../hooks/queries/user.queries'
import type { UserRole } from '../auth/types'
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

interface SignupFormProps extends React.ComponentProps<typeof Card> {
  role: UserRole
}

export function SignupForm({ role, ...props }: SignupFormProps) {
  const navigate = useNavigate()
  const { mutateAsync: signup, isPending } = useSignupMutation()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const signupPromise = signup({
      role,
      fullName,
      password,
      username: role === 'lecturer' ? username : undefined,
      studentNumber: role === 'student' ? studentNumber : undefined,
    })

    toast.promise(signupPromise, {
      loading: 'Creating your account...',
      success: () => {
        navigate({ to: '/login' })
        return 'Account created successfully! Please log in.'
      },
      error: (err: any) => {
        const backendError = err.response?.data
        return backendError?.message || 'Registration failed'
      },
    })
  }

  return (
    <Card className="border-none shadow-none" {...props}>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">
          Register as {role === 'student' ? 'Student' : 'Lecturer'}
        </CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Field>
            {role === 'lecturer' ? (
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="studentNumber">
                  Matriculation Number
                </FieldLabel>
                <Input
                  id="studentNumber"
                  type="text"
                  placeholder="Enter your matriculation number"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  required
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </Field>
            <Field className="md:col-span-2 mt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
