import { api } from '../../lib/api'
import type { ServerResponse } from './types'

export interface Subject {
  id: string
  lecturerId: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubjectInput {
  name: string
  code: string
}

export interface UpdateSubjectInput {
  name?: string
  code?: string
}

export interface Enrollment {
  id: string
  userId: string
  subjectId: string | Subject
  subject?: Subject
  createdAt: string
  updatedAt: string
}

export const subjectsApi = {
  list: async () => {
    const response = await api.get<ServerResponse<Array<Subject>>>('/subjects')
    return response.data.data
  },

  create: async (data: CreateSubjectInput) => {
    const response = await api.post<ServerResponse<Subject>>('/subjects', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateSubjectInput) => {
    const response = await api.put<ServerResponse<Subject>>(
      `/subjects/${id}`,
      data,
    )
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await api.delete<ServerResponse<void>>(`/subjects/${id}`)
    return response.data.data
  },

  register: async (id: string) => {
    const response = await api.post<ServerResponse<Enrollment>>(
      `/subjects/register/${id}`,
    )
    return response.data.data
  },

  listEnrolled: async () => {
    const response =
      await api.get<ServerResponse<Array<Enrollment>>>('/subjects/enrolled')
    return response.data.data
  },
}
