import { api } from '../../lib/api'
import type { ServerResponse } from './types'

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
}

export const promptsApi = {
  list: async () => {
    const response = await api.get<ServerResponse<Array<Prompt>>>('/prompts')
    return response.data.data
  },
}
