import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentsApi } from '../api/assessments.api'

export function useAssessmentsQuery(subjectId?: string) {
  return useQuery({
    queryKey: ['assessments', { subjectId }],
    queryFn: () => assessmentsApi.list(subjectId),
  })
}

export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useDeleteAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useUpdateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}
