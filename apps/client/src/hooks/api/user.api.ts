import { api } from '../../lib/api'
import type { User, UserRole } from '../../auth/types'
import type { ServerResponse } from './types'

export interface LoginResponse {
  token: string
  user: User
}

export interface SignupInput {
  fullName: string
  username?: string
  studentNumber?: string
  password: string
  role: UserRole
}

export interface EnrolledStudent {
  id: string
  student: User
  subject: {
    id: string
    name: string
    code: string
  }
  enrolledAt: string
}

export const userApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    const response = await api.post<ServerResponse<LoginResponse>>(
      '/users/auth/login',
      credentials,
    )
    return response.data.data
  },

  register: async (data: SignupInput) => {
    const response = await api.post<ServerResponse<User>>(
      '/users/auth/register',
      data,
    )
    return response.data.data
  },

  getMe: async () => {
    const response = await api.get<ServerResponse<User>>('/users/me')
    return response.data.data
  },

  getUsers: async () => {
    const response = await api.get<ServerResponse<Array<User>>>('/users')
    return response.data.data
  },

  verifyStudent: async (studentNumber: string) => {
    const response = await api.get<ServerResponse<User>>('/users/verify', {
      params: { studentNumber },
    })
    return response.data.data
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ServerResponse<void>>(`/users/${id}`)
    return response.data.data
  },

  getEnrolledStudents: async (subjectId?: string) => {
    const response = await api.get<ServerResponse<Array<EnrolledStudent>>>(
      '/users/enrolled-students',
      { params: { subjectId } },
    )
    return response.data.data
  },
}
