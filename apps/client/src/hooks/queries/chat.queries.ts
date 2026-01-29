import { useMutation } from '@tanstack/react-query'
import { chatApi } from '../api/chat.api'
import { useAuthStore } from '../../auth/auth-store'

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  response: string
}

export interface ChatStreamOptions {
  onChunk?: (chunk: string) => void
  onFinish?: (fullResponse: string) => void
  onError?: (error: Error) => void
}

export function useChatMutation() {
  return useMutation({
    mutationFn: chatApi.sendMessage,
  })
}

export function useChatStream() {
  const { token } = useAuthStore()

  return useMutation({
    mutationFn: ({
      message,
      options,
    }: {
      message: string
      options?: ChatStreamOptions
    }) => chatApi.streamMessage(message, token, options),
  })
}
