import { createFileRoute } from '@tanstack/react-router'
import { AIInterface } from '@/components/chat/ai-interface'

import { z } from 'zod'

const chatSearchSchema = z.object({
  threadId: z.string().optional(),
})

export type ChatSearch = z.infer<typeof chatSearchSchema>

export const Route = createFileRoute('/_authenticated/student/ai')({
  validateSearch: chatSearchSchema,
  component: StudentAIPage,
})

function StudentAIPage() {
  const { threadId } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <AIInterface
      initialMessage="Hello! I'm your AI Academic Assistant. Ask me about your grades, GPA, or performance predictions."
      promptCategory="student"
      placeholder="Talk with EduBot about your academics..."
      threadId={threadId}
      onThreadIdChange={(id) => navigate({ search: { threadId: id } })}
    />
  )
}
