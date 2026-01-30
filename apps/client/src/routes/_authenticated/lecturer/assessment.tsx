import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

import type { Assessment } from '@/hooks/api/assessments.api'
import {
  useAssessmentsQuery,
  useCreateAssessmentMutation,
  useDeleteAssessmentMutation,
  useUpdateAssessmentMutation,
} from '@/hooks/queries/assessments.queries'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { AssessmentFormDialog } from '@/components/assessments/assessment-form-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { SubjectFilter } from '@/components/filters/subject-filter'
import { useSubjectsQuery } from '@/hooks/queries/subjects.queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/lecturer/assessment')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedAssessment, setSelectedAssessment] =
    React.useState<Assessment | null>(null)
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all')

  const { data: assessments, isLoading: isAssessmentsLoading } =
    useAssessmentsQuery(selectedSubject === 'all' ? undefined : selectedSubject)
  const { data: subjects, isLoading: isSubjectsLoading } = useSubjectsQuery()
  const { mutateAsync: createAssessment, isPending: isCreating } =
    useCreateAssessmentMutation()
  const { mutateAsync: updateAssessment, isPending: isUpdating } =
    useUpdateAssessmentMutation()
  const { mutateAsync: deleteAssessment, isPending: isDeleting } =
    useDeleteAssessmentMutation()

  const isLoading = isAssessmentsLoading || isSubjectsLoading

  const columns: Array<ColumnDef<Assessment>> = [
    {
      accessorKey: 'name',
      header: 'Assessment Name',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'subjectId',
      header: 'Subject',
      cell: ({ row }) => {
        const subject = row.original.subjectId
        const name = typeof subject !== 'string' ? subject.name : 'N/A'
        return (
          <Badge variant="outline" className="font-normal">
            {name}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'maxScore',
      header: 'Max Score',
      cell: ({ row }) => (
        <div className="text-center md:text-left">
          {row.getValue('maxScore')} pts
        </div>
      ),
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden hidden md:block">
            <div
              className="h-full bg-primary"
              style={{ width: `${row.getValue('weight')}%` }}
            />
          </div>
          <span className="font-medium">{row.getValue('weight')}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const assessment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  setSelectedAssessment(assessment)
                  setIsEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={() => {
                  setSelectedAssessment(assessment)
                  setIsDeleteOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleCreateAssessment = (data: any) => {
    toast.promise(createAssessment(data), {
      loading: 'Creating assessment...',
      success: () => {
        setIsAddOpen(false)
        return 'Assessment created successfully'
      },
      error: (err: any) => {
        const backendError = err.response?.data
        return backendError?.message || 'Failed to create assessment'
      },
    })
  }

  const handleUpdateAssessment = (data: any) => {
    if (!selectedAssessment) return

    toast.promise(
      updateAssessment({
        id: selectedAssessment.id,
        data: {
          name: data.name,
          maxScore: data.maxScore,
          weight: data.weight,
        },
      }),
      {
        loading: 'Updating assessment...',
        success: () => {
          setIsEditOpen(false)
          setSelectedAssessment(null)
          return 'Assessment updated successfully'
        },
        error: (err: any) => {
          const backendError = err.response?.data
          return backendError?.message || 'Failed to update assessment'
        },
      },
    )
  }

  const handleDeleteAssessment = () => {
    if (!selectedAssessment) return

    toast.promise(deleteAssessment(selectedAssessment.id), {
      loading: 'Deleting assessment...',
      success: () => {
        setIsDeleteOpen(false)
        setSelectedAssessment(null)
        return 'Assessment deleted successfully'
      },
      error: (err: any) => {
        const backendError = err.response?.data
        return backendError?.message || 'Failed to delete assessment'
      },
    })
  }

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={ClipboardList}
        title="Assessments"
        description="Manage exams, quizzes, and assignments for your subjects."
        action={
          <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
            <SubjectFilter
              value={selectedSubject}
              onChange={setSelectedSubject}
              subjects={subjects}
              label=""
            />
            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Assessment</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        }
      />

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Assessment Records</span>
            {selectedSubject !== 'all' && (
              <Badge variant="outline" className="font-normal capitalize">
                {subjects?.find((s) => s.id === selectedSubject)?.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : assessments && assessments.length > 0 ? (
              <div className="rounded-xl border border-border overflow-hidden">
                <DataTable columns={columns} data={assessments} />
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title={
                  selectedSubject !== 'all'
                    ? 'No assessments for this subject'
                    : 'No assessments yet'
                }
                description={
                  selectedSubject !== 'all'
                    ? 'Try selecting a different subject or create a new assessment.'
                    : 'Create your first assessment to start tracking student progress.'
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      <AssessmentFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleCreateAssessment}
        isPending={isCreating}
      />

      <AssessmentFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setSelectedAssessment(null)
        }}
        title="Edit Assessment"
        submitText="Save Changes"
        initialData={
          selectedAssessment
            ? {
                subjectId:
                  typeof selectedAssessment.subjectId === 'string'
                    ? selectedAssessment.subjectId
                    : selectedAssessment.subjectId.id,
                name: selectedAssessment.name,
                maxScore: selectedAssessment.maxScore,
                weight: selectedAssessment.weight,
              }
            : null
        }
        onSubmit={handleUpdateAssessment}
        isPending={isUpdating}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Assessment"
        description={`Are you sure you want to delete "${selectedAssessment?.name}"? This action cannot be undone.`}
        isPending={isDeleting}
        onConfirm={handleDeleteAssessment}
        confirmText="Yes, Delete Assessment"
      />
    </div>
  )
}
