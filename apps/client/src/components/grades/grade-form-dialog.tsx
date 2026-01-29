import * as React from 'react'
import { Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Grade } from '@/hooks/api/grades.api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubjectsQuery } from '@/hooks/queries/subjects.queries'
import { useAssessmentsQuery } from '@/hooks/queries/assessments.queries'
import { useEnrolledStudentsQuery } from '@/hooks/queries/user.queries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface GradeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    studentNumber: string
    assessmentId: string
    score: number
  }) => void
  initialData?: Grade | null
  isPending?: boolean
}

export function GradeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: GradeFormDialogProps) {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState('')
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState('')
  const [selectedStudentNumber, setSelectedStudentNumber] = React.useState('')
  const [score, setScore] = React.useState<number | string>('')

  const isEdit = !!initialData

  const { data: subjects } = useSubjectsQuery()
  const { data: assessments } = useAssessmentsQuery(selectedSubjectId)
  const { data: students } = useEnrolledStudentsQuery(selectedSubjectId)

  const currentAssessment = assessments?.find(
    (a) => a.id === selectedAssessmentId,
  )

  // Prepare fallback labels for edit mode
  const editSubjectName = initialData?.assessment?.subjectId
    ? `${initialData.assessment.subjectId.name} (${initialData.assessment.subjectId.code})`
    : ''
  const editAssessmentName = initialData?.assessment?.name || ''
  const editStudentName = initialData?.student
    ? `${initialData.student.fullName} (${initialData.studentNumber})`
    : initialData?.studentNumber || ''

  // Initialize form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      // Use explicit ID mapping from service or fall back to object property
      const sub = initialData.assessment?.subjectId as any
      setSelectedSubjectId(sub?.id || sub?._id?.toString() || '')

      const ass = initialData.assessment as any
      setSelectedAssessmentId(
        initialData.assessmentId || ass?.id || ass?._id?.toString() || '',
      )

      setSelectedStudentNumber(initialData.studentNumber)
      setScore(initialData.score)
    } else if (open) {
      setSelectedSubjectId('')
      setSelectedAssessmentId('')
      setSelectedStudentNumber('')
      setScore('')
    }
  }, [initialData, open])

  // Reset dependent fields when subject changes ONLY IN ADD MODE
  React.useEffect(() => {
    if (!isEdit && selectedSubjectId) {
      setSelectedAssessmentId('')
      setSelectedStudentNumber('')
      setScore('')
    }
  }, [selectedSubjectId, isEdit])

  // Show toasts if subject has no assessments or students
  React.useEffect(() => {
    if (!isEdit && selectedSubjectId && assessments && students) {
      if (assessments.length === 0) {
        toast.error(
          'This subject has no assessments yet. Please create one first.',
          {
            id: `no-assessments-${selectedSubjectId}`,
          },
        )
      }
      if (students.length === 0) {
        toast.error('No students are registered for this subject yet.', {
          id: `no-students-${selectedSubjectId}`,
        })
      }
    }
  }, [selectedSubjectId, assessments, students, isEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentNumber || !selectedAssessmentId) return
    onSubmit({
      studentNumber: selectedStudentNumber,
      assessmentId: selectedAssessmentId,
      score: Number(score),
    })
  }

  const title = isEdit ? 'Edit Grade' : 'Input Grades'
  const description = isEdit
    ? 'Update student score for this assessment'
    : 'Record student scores for assessments'
  const submitText = isEdit ? 'Update Grade' : 'Save Grade'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={isEdit}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select a subject">
                  {isEdit ? editSubjectName : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <Label>
                Assessment <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedAssessmentId}
                onValueChange={setSelectedAssessmentId}
                disabled={!selectedSubjectId || isEdit}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue
                    placeholder={
                      !selectedSubjectId
                        ? 'Select subject first'
                        : 'Select assessment'
                    }
                  >
                    {isEdit ? editAssessmentName : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {assessments?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} (Max: {a.maxScore})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Which assessment</p>
            </div>

            <div className="space-y-2">
              <Label>
                Student <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedStudentNumber}
                onValueChange={setSelectedStudentNumber}
                disabled={!selectedSubjectId || isEdit}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue
                    placeholder={
                      !selectedSubjectId
                        ? 'Select subject first'
                        : 'Select student'
                    }
                  >
                    {isEdit ? editStudentName : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s) => (
                    <SelectItem
                      key={s.student.studentNumber}
                      value={s.student.studentNumber || ''}
                    >
                      {s.student.fullName} ({s.student.studentNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Student's matriculation number
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">
              Score <span className="text-destructive">*</span>
            </Label>
            <Input
              id="score"
              type="number"
              min="0"
              max={currentAssessment?.maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Points earned"
              className="h-11 rounded-xl"
              required
              disabled={!selectedAssessmentId}
            />
            {currentAssessment && (
              <p className="text-xs text-muted-foreground">
                Max points: {currentAssessment.maxScore}
              </p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
            <Info className="h-5 w-5 shrink-0" />
            <p>
              <strong>Note:</strong> You can find matriculation numbers and
              Assessment IDs in the "Registered Subjects" table below.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isPending || !selectedStudentNumber || !selectedAssessmentId
              }
              className="w-full rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
