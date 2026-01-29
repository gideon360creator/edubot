import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subjectsApi } from '../api/subjects.api'
import type { UpdateSubjectInput } from '../api/subjects.api'

export function useSubjectsQuery() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsApi.list,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectInput }) =>
      subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subjectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useRegisterSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subjectsApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}

export function useEnrolledSubjectsQuery() {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: subjectsApi.listEnrolled,
  })
}
