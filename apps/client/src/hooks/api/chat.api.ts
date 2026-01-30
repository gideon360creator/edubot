import { api } from '../../lib/api'
import type {
  ChatRequest,
  ChatResponse,
  ChatStreamOptions,
  ChatMessage,
  ChatThread,
} from '../queries/chat.queries'
import type { ServerResponse } from './types'
import { env } from '@/env'

export const chatApi = {
  sendMessage: async (data: ChatRequest) => {
    const response = await api.post<ServerResponse<ChatResponse>>('/chat', data)
    return response.data.data
  },
  getHistory: async (threadId?: string) => {
    if (!threadId) return []
    const response = await api.get<ServerResponse<{ history: ChatMessage[] }>>(
      `/chat/history?threadId=${threadId}`,
    )
    return response.data.data.history
  },
  getThreads: async () => {
    const response =
      await api.get<ServerResponse<{ threads: ChatThread[] }>>('/chat/threads')
    return response.data.data.threads
  },

  streamMessage: async (
    message: string,
    token: string | null,
    options?: ChatStreamOptions,
    threadId?: string,
  ) => {
    const baseURL = env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

    const response = await fetch(`${baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, threadId }),
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
    let serverThreadId: string | undefined

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

          try {
            const parsed = JSON.parse(data)
            if (parsed.chunk) {
              fullResponse += parsed.chunk
              options?.onChunk?.(parsed.chunk)
            } else if (parsed.done) {
              serverThreadId = parsed.threadId
              options?.onFinish?.(fullResponse, serverThreadId)
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

    return { fullResponse, threadId: serverThreadId }
  },
}
