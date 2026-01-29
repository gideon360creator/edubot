import { api } from '../../lib/api'
import type {
  ChatRequest,
  ChatResponse,
  ChatStreamOptions,
} from '../queries/chat.queries'
import type { ServerResponse } from './types'
import { env } from '@/env'

export const chatApi = {
  sendMessage: async (data: ChatRequest) => {
    const response = await api.post<ServerResponse<ChatResponse>>('/chat', data)
    return response.data.data
  },

  streamMessage: async (
    message: string,
    token: string | null,
    options?: ChatStreamOptions,
  ) => {
    const baseURL = env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

    const response = await fetch(`${baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Failed to start chat stream')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No readable stream')
    }

    let buffer = ''
    const decoder = new TextDecoder()
    let fullResponse = ''

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          const data = trimmedLine.slice(6).trim()
          if (data === '[DONE]') {
            options?.onFinish?.(fullResponse)
            continue
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.chunk) {
              fullResponse += parsed.chunk
              options?.onChunk?.(parsed.chunk)
            } else if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch (e) {
            if (e instanceof Error) throw e
            console.error('Error parsing SSE data:', e, data)
          }
        }
      }
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }

    return fullResponse
  },
}
