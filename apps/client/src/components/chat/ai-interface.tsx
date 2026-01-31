import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { jsonToPlainText } from 'json-to-plain-text'

import type { Prompt } from '@/hooks/api/prompts.api'
import { AIInput } from './ai-input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useChatStream,
  useChatHistory,
  useChatThreads,
} from '@/hooks/queries/chat.queries'
import { usePromptsQuery } from '@/hooks/queries/prompts.queries'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Bot, Check, Clock, Copy, SquarePen, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-foreground transition-colors absolute -bottom-7 right-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span className="sr-only">Copy message</span>
    </Button>
  )
}

interface AIInterfaceProps {
  initialMessage?: string
  promptCategory?: string
  placeholder?: string
  threadId?: string
  onThreadIdChange?: (threadId?: string) => void
}

export function AIInterface({
  initialMessage = "Hello! I'm your AI Academic Assistant. Ask me anything.",
  promptCategory,
  placeholder = 'Talk with EduBot...',
  threadId,
  onThreadIdChange,
}: AIInterfaceProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<Message>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ])
  const [activeContent, setActiveContent] = useState('')
  const [displayedContent, setDisplayedContent] = useState('')
  const [isApiDone, setIsApiDone] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [promptsModalOpen, setPromptsModalOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesThreadIdRef = useRef<string | undefined>(threadId)
  const queryClient = useQueryClient()

  const { mutate: streamChat, isPending } = useChatStream()
  const { data: prompts, isLoading: isLoadingPrompts } = usePromptsQuery()
  const { data: chatThreads, isLoading: isLoadingThreads } = useChatThreads()
  const { data: chatHistory, isLoading: isLoadingHistory } =
    useChatHistory(threadId)

  const startNewChat = () => {
    onThreadIdChange?.(undefined)
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      },
    ])
    setActiveContent('')
    setDisplayedContent('')
  }

  // Load history into messages
  useEffect(() => {
    // Only sync from history if we are NOT streaming
    if (!isStreaming && chatHistory) {
      const historicalMessages: Message[] = chatHistory.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
      }))

      // If we switch threads, or if we have no messages yet, or if history length changed
      // (This covers initial load and thread switches)
      if (
        messagesThreadIdRef.current !== threadId ||
        (historicalMessages.length > 0 && messages.length <= 1)
      ) {
        setMessages(historicalMessages)
        messagesThreadIdRef.current = threadId
      }
    }
  }, [chatHistory, isStreaming, threadId, messages.length])

  // Handle "New Chat" state
  useEffect(() => {
    if (threadId === undefined) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        },
      ])
      messagesThreadIdRef.current = undefined
    }
  }, [threadId, initialMessage])

  // Typewriter Effect & History Commitment
  useEffect(() => {
    if (activeContent.length > displayedContent.length) {
      const timer = setTimeout(() => {
        // High speed: jump by 10 chars
        setDisplayedContent(
          activeContent.slice(0, displayedContent.length + 10),
        )
      }, 5)
      return () => clearTimeout(timer)
    } else if (
      isApiDone &&
      activeContent.length === displayedContent.length &&
      activeContent !== ''
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: activeContent,
          timestamp: new Date(),
        },
      ])
      setIsStreaming(false)
      setIsApiDone(false)
      setActiveContent('')
      setDisplayedContent('')
    }
  }, [activeContent, displayedContent, isApiDone])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, displayedContent, isPending, scrollToBottom])

  const formatContent = (content: string) => {
    try {
      const trimmed = content.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed)
        return jsonToPlainText(parsed, {
          spacing: true,
          seperator: ': ',
        })
      }
    } catch (e) {
      // Not valid (or complete) JSON
    }
    return content
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || isPending || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setActiveContent('')
    setDisplayedContent('')
    setIsStreaming(true)

    let accumulatedContent = ''

    streamChat(
      {
        message: text,
        threadId: threadId,
        options: {
          onChunk: (chunk) => {
            accumulatedContent += chunk
            setActiveContent(accumulatedContent)
          },
          onFinish: (fullResponse, newThreadId) => {
            if (!fullResponse && !accumulatedContent) {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: 'I received an empty response. Please try again.',
                  timestamp: new Date(),
                },
              ])
              setIsStreaming(false)
              return
            }
            if (newThreadId) {
              onThreadIdChange?.(newThreadId)
              queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
            }
            setActiveContent(fullResponse || accumulatedContent)
            setIsApiDone(true)
          },
          onError: (err) => {
            setIsStreaming(false)
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${err.message}`,
                timestamp: new Date(),
              },
            ])
            setActiveContent('')
            setDisplayedContent('')
            setIsApiDone(false)
          },
        },
      },
      {
        onError: () => {
          setIsStreaming(false)
          setIsApiDone(false)
        },
      },
    )
  }

  const filteredPrompts = useMemo(() => {
    if (!prompts) return []
    const isRole = promptCategory === 'student' || promptCategory === 'lecturer'
    const filtered =
      promptCategory && !isRole
        ? prompts.filter((p) => p.category === promptCategory)
        : prompts
    return filtered.slice(0, 5)
  }, [prompts, promptCategory])

  const groupedPrompts = useMemo(() => {
    const groups: Record<string, Array<Prompt> | undefined> = {}
    if (!prompts) return groups
    for (const prompt of prompts) {
      if (!groups[prompt.category]) {
        groups[prompt.category] = []
      }
      groups[prompt.category]!.push(prompt)
    }
    return groups
  }, [prompts])

  return (
    <div className="flex w-full min-w-0 flex-col h-[calc(100dvh-96px)] max-w-5xl mx-auto px-4 gap-3 sm:gap-4 overflow-hidden">
      <div className="flex w-full min-w-0 items-center justify-between py-2 border-b">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-md">
            {chatThreads?.find((t) => t.id === threadId)?.title || 'New Chat'}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-4 shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            className="rounded-full gap-2 text-muted-foreground hover:text-foreground shadow-none border-none cursor-pointer"
          >
            <SquarePen className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-2 text-muted-foreground hover:text-foreground shadow-none border-none cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 max-h-96 overflow-y-auto custom-scrollbar"
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Your Chats
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingThreads && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Loading history...
                </div>
              )}
              {chatThreads?.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No chat history found.
                </div>
              )}
              {chatThreads?.map((thread) => (
                <DropdownMenuItem
                  key={thread.id}
                  onClick={() => onThreadIdChange?.(thread.id)}
                  className={cn(
                    'cursor-pointer py-2 px-3 focus:bg-primary/5 rounded-xl transition-colors',
                    threadId === thread.id &&
                      'bg-primary/5 text-primary font-medium',
                  )}
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="text-sm truncate">{thread.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden border-none shadow-none bg-transparent">
        <CardContent
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-1 space-y-6 scroll-smooth pb-10 custom-scrollbar min-h-0"
        >
          {isLoadingHistory && messages.length <= 1 && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-16 w-[70%] rounded-2xl" />
              <Skeleton className="h-20 w-[60%] rounded-2xl ml-auto" />
              <Skeleton className="h-16 w-[75%] rounded-2xl" />
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3 max-w-[88%]',
                  message.role === 'user'
                    ? 'ml-auto flex-row-reverse'
                    : 'mr-auto',
                )}
              >
                <div
                  className={cn(
                    'mt-1 flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-muted',
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all relative',
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-muted/50 text-foreground rounded-tl-none border border-muted',
                  )}
                >
                  <div
                    className={cn(
                      'prose prose-sm dark:prose-invert max-w-none leading-snug space-y-0',
                      message.role === 'user'
                        ? 'text-white'
                        : 'text-foreground',
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-1 pl-4 list-disc space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="my-1 pl-4 list-decimal space-y-0.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="my-0">{children}</li>
                        ),
                      }}
                    >
                      {formatContent(message.content)}
                    </ReactMarkdown>
                  </div>
                  <CopyButton content={message.content} />
                </div>
              </motion.div>
            ))}

            {isStreaming && displayedContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-auto max-w-[88%]"
              >
                <div className="bg-muted border border-muted mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm border border-muted/50 relative">
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-snug space-y-0 text-foreground">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-1 pl-4 list-disc space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="my-1 pl-4 list-decimal space-y-0.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="my-0">{children}</li>
                        ),
                      }}
                    >
                      {formatContent(displayedContent)}
                    </ReactMarkdown>
                    <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                  </div>
                  <CopyButton content={displayedContent} />
                </div>
              </motion.div>
            )}

            {isPending && !displayedContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mr-auto max-w-[85%]"
              >
                <div className="bg-muted border border-muted mt-1 flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted/30 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 border border-muted/50">
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce animation-duration-[1s]" />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce animation-duration-[1s] [animation-delay:0.2s]" />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce animation-duration-[1s] [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="bg-background pt-4 sm:pt-6 border-t space-y-4">
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible lg:justify-center">
          {isLoadingPrompts ? (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          ) : (
            <>
              <AnimatePresence>
                {filteredPrompts.map((prompt) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-[11px] h-8 bg-background hover:bg-muted font-medium transition-all hover:border-primary/50 text-muted-foreground hover:text-foreground"
                          onClick={() => setInput(prompt.content)}
                        >
                          {prompt.title}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[250px]">
                        <p>{prompt.content}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </AnimatePresence>
              {prompts &&
                (promptCategory === 'student' || promptCategory === 'lecturer'
                  ? prompts.length
                  : prompts.filter((p) => p.category === promptCategory)
                      .length) > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs h-8 font-semibold text-primary hover:bg-primary/5"
                    onClick={() => setPromptsModalOpen(true)}
                  >
                    More Prompts
                  </Button>
                )}
            </>
          )}
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <AIInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isPending={isPending}
            isStreaming={isStreaming}
            placeholder={placeholder}
          />
        </div>
        <p className="text-[10px] text-center text-muted-foreground">
          EduBot can make mistakes. Check important info.
        </p>
      </div>

      <Dialog open={promptsModalOpen} onOpenChange={setPromptsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col p-6 rounded-3xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Suggested Prompts
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pt-4 space-y-8 custom-scrollbar pr-2">
            {Object.entries(groupedPrompts).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items?.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => {
                        setInput(prompt.content)
                        setPromptsModalOpen(false)
                      }}
                      className="group flex flex-col items-start gap-2 p-4 rounded-2xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {prompt.title}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {prompt.content}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
