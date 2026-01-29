import { createFileRoute } from '@tanstack/react-router'
import { AIInterface } from '@/components/chat/ai-interface'

export const Route = createFileRoute('/_authenticated/lecturer/ai')({
  component: LecturerAIPage,
})

function LecturerAIPage() {
  return (
    <AIInterface
      initialMessage="Hello! I'm your AI Teaching Assistant. I can help you with grade analysis, student performance reviews, and administrative tasks."
      promptCategory="lecturer"
      placeholder="Talk with EduBot about your classes and students..."
    />
  )
}
