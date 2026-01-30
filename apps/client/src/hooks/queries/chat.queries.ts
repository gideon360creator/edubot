import { chatApi } from '../api/chat.api'
import { useAuthStore } from '../../auth/auth-store'
import { useMutation, useQuery } from '@tanstack/react-query'

export interface ChatRequest {
  message: string
  threadId?: string
}

export interface ChatThread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatResponse {
  response: string
  threadId?: string
}

export interface ChatStreamOptions {
  onChunk?: (chunk: string) => void
  onFinish?: (fullResponse: string, threadId?: string) => void
  onError?: (error: Error) => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  updatedAt: string
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
      threadId,
      options,
    }: {
      message: string
      threadId?: string
      options?: ChatStreamOptions
    }) => chatApi.streamMessage(message, token, options, threadId),
  })
}

export function useChatThreads() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['chat-threads'],
    queryFn: chatApi.getThreads,
    enabled: isAuthenticated,
  })
}

export function useChatHistory(threadId?: string) {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['chat-history', threadId],
    queryFn: () => chatApi.getHistory(threadId),
    enabled: isAuthenticated && !!threadId,
  })
}
