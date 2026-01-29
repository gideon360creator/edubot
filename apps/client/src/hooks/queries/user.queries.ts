import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/user.api'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useSignupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
    enabled,
  })
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  })
}

export function useVerifyStudentQuery(studentNumber: string, enabled = false) {
  return useQuery({
    queryKey: ['users', 'verify', studentNumber],
    queryFn: () => userApi.verifyStudent(studentNumber),
    enabled: enabled && !!studentNumber,
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useEnrolledStudentsQuery(subjectId?: string) {
  return useQuery({
    queryKey: ['users', 'enrolled', subjectId],
    queryFn: () => userApi.getEnrolledStudents(subjectId),
  })
}
