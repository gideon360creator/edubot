import { createFileRoute } from '@tanstack/react-router'
import { AIInterface } from '@/components/chat/ai-interface'

export const Route = createFileRoute('/_authenticated/student/ai')({
  component: StudentAIPage,
})

function StudentAIPage() {
  return (
    <AIInterface
      initialMessage="Hello! I'm your AI Academic Assistant. Ask me about your grades, GPA, or performance predictions."
      promptCategory="student"
      placeholder="Talk with EduBot about your academics..."
    />
  )
}
