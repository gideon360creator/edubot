import { api } from '../../lib/api'
import type { ServerResponse } from './types'
import type { User } from '../../auth/types'

export interface Grade {
  id: string
  studentId: string | User
  assessmentId:
    | string
    | {
        id: string
        name: string
        maxScore: number
        weight: number
        subjectId: {
          id: string
          name: string
          code: string
        }
      }
  studentNumber: string
  score: number
  student?: User
  assessment?: {
    id: string
    name: string
    maxScore: number
    weight: number
    subjectId: {
      id: string
      name: string
      code: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface CreateGradeInput {
  studentNumber: string
  assessmentId: string
  score: number
}

export const gradesApi = {
  list: async (subjectId?: string) => {
    const response = await api.get<ServerResponse<Array<Grade>>>('/grades', {
      params: { subjectId },
    })
    return response.data.data
  },

  create: async (data: CreateGradeInput) => {
    const response = await api.post<ServerResponse<Grade>>('/grades', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<CreateGradeInput>) => {
    const response = await api.patch<ServerResponse<Grade>>(
      `/grades/${id}`,
      data,
    )
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/grades/${id}`)
    return true
  },

  listMyGrades: async () => {
    const response = await api.get<ServerResponse<Array<Grade>>>('/grades/me')
    return response.data.data
  },

  getMyGpa: async () => {
    const response = await api.get<
      ServerResponse<{
        gpa: number
        percentage: number
        recorded_weight: number
        graded_assessments: number
      }>
    >('/grades/me/gpa')
    return response.data.data
  },
}
