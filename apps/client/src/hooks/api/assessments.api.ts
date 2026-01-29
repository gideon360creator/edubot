import { api } from '../../lib/api'
import type { ServerResponse } from './types'

export interface Assessment {
  id: string
  subjectId:
    | string
    | {
        id: string
        name: string
        code: string
      }
  name: string
  maxScore: number
  weight: number
  createdAt: string
  updatedAt: string
}

export interface CreateAssessmentInput {
  subjectId: string
  name: string
  maxScore: number
  weight: number
}

export const assessmentsApi = {
  list: async (subjectId?: string) => {
    const response = await api.get<ServerResponse<Array<Assessment>>>(
      '/assessments',
      {
        params: { subjectId },
      },
    )
    return response.data.data
  },

  create: async (data: CreateAssessmentInput) => {
    const response = await api.post<ServerResponse<Assessment>>(
      '/assessments',
      data,
    )
    return response.data.data
  },

  update: async ({ id, data }: { id: string; data: Partial<Assessment> }) => {
    const response = await api.patch<ServerResponse<Assessment>>(
      `/assessments/${id}`,
      data,
    )
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/assessments/${id}`)
    return true
  },
}
