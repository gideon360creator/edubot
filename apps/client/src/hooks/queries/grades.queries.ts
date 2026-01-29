import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gradesApi } from '../api/grades.api'
import type { CreateGradeInput } from '../api/grades.api'

export function useGradesQuery(subjectId?: string) {
  return useQuery({
    queryKey: ['grades', subjectId],
    queryFn: () => gradesApi.list(subjectId),
  })
}

export function useCreateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGradeInput) => gradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      // Also invalidate enrollments/subjects if GPA related data changes
      queryClient.invalidateQueries({ queryKey: ['users', 'enrolled'] })
    },
  })
}

export function useUpdateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateGradeInput>
    }) => gradesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
    },
  })
}

export function useDeleteGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gradesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
    },
  })
}

export function useMyGradesQuery() {
  return useQuery({
    queryKey: ['grades', 'me'],
    queryFn: () => gradesApi.listMyGrades(),
  })
}

export function useMyGpaQuery() {
  return useQuery({
    queryKey: ['grades', 'me', 'gpa'],
    queryFn: () => gradesApi.getMyGpa(),
  })
}
