import { useQuery } from '@tanstack/react-query'
import { promptsApi } from '../api/prompts.api'

export function usePromptsQuery() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: promptsApi.list,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  })
}
