import { createFileRoute } from '@tanstack/react-router'
import { AIInterface } from '@/components/chat/ai-interface'

import { z } from 'zod'

const chatSearchSchema = z.object({
  threadId: z.string().optional(),
})

export type ChatSearch = z.infer<typeof chatSearchSchema>

export const Route = createFileRoute('/_authenticated/lecturer/ai')({
  validateSearch: chatSearchSchema,
  component: LecturerAIPage,
})

function LecturerAIPage() {
  const { threadId } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <AIInterface
      initialMessage="Hello! I'm your AI Teaching Assistant. I can help you with grade analysis, student performance reviews, and administrative tasks."
      promptCategory="lecturer"
      placeholder="Talk with EduBot about your classes and students..."
      threadId={threadId}
      onThreadIdChange={(id) => navigate({ search: { threadId: id } })}
    />
  )
}
