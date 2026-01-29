import * as React from 'react'
import { Info, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AssessmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    subjectId: string
    name: string
    maxScore: number
    weight: number
  }) => void
  initialData?: {
    subjectId?: string
    name?: string
    maxScore?: number
    weight?: number
  } | null
  isPending?: boolean
  title?: string
  submitText?: string
}

// const DEFAULT_DATA = {
//   subjectId: '',
//   name: '',
//   maxScore: 100,
//   weight: 0,
// }

export function AssessmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
  title = 'Add Assessment',
  submitText = 'Create Assessment',
}: AssessmentFormDialogProps) {
  const [formData, setFormData] = React.useState<{
    subjectId: string
    name: string
    maxScore: number | string
    weight: number | string
  }>({
    subjectId: initialData?.subjectId || '',
    name: initialData?.name || '',
    maxScore: initialData?.maxScore ?? '',
    weight: initialData?.weight ?? '',
  })
  const { data: subjects } = useSubjectsQuery()

  React.useEffect(() => {
    if (open) {
      setFormData({
        subjectId: initialData?.subjectId || '',
        name: initialData?.name || '',
        maxScore: initialData?.maxScore ?? '',
        weight: initialData?.weight ?? '',
      })
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subjectId || !formData.name) return
    onSubmit({
      ...formData,
      maxScore: Number(formData.maxScore),
      weight: Number(formData.weight),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {title}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update assessment details for your subjects'
              : 'Create graded activities (exams, quizzes, assignments) for your subjects'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="subjectId">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.subjectId}
                onValueChange={(val) =>
                  setFormData({ ...formData, subjectId: val })
                }
              >
                <SelectTrigger
                  id="subjectId"
                  className="h-11 w-full rounded-xl"
                >
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Assessment Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. midterm test"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl border-border focus:ring-primary px-4 h-11"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxScore">
                Max Score <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                value={formData.maxScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxScore: e.target.value,
                  })
                }
                className="rounded-xl border-border focus:ring-primary px-4 h-11"
                required
              />
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Maximum points possible
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight % <span className="text-destructive">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: e.target.value,
                  })
                }
                className="rounded-xl border-border focus:ring-primary px-4 h-11"
                required
              />
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                % of final grade
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-sm text-primary/80">
            <Info className="h-5 w-5 shrink-0" />
            <p>
              <strong>Tip:</strong> All assessment weights for a subject should
              add up to 100%. Example: Midterm (30%) + Final (40%) + Assignments
              (30%) = 100%
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
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
