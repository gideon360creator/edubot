import * as React from 'react'
import { FileText, Filter, Pencil, Plus, Trash2 } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

import type { Grade } from '@/hooks/api/grades.api'
import {
  useCreateGradeMutation,
  useDeleteGradeMutation,
  useGradesQuery,
  useUpdateGradeMutation,
} from '@/hooks/queries/grades.queries'
import { useSubjectsQuery } from '@/hooks/queries/subjects.queries'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { GradeFormDialog } from '@/components/grades/grade-form-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/_authenticated/lecturer/manage-grades')({
  component: ManageGradesPage,
})

function ManageGradesPage() {
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all')
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [editingGrade, setEditingGrade] = React.useState<Grade | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const {
    data: grades,
    isLoading: isGradesLoading,
    error,
  } = useGradesQuery(selectedSubject === 'all' ? undefined : selectedSubject)

  const { data: subjects, isLoading: isSubjectsLoading } = useSubjectsQuery()
  const { mutateAsync: createGrade, isPending: isCreating } =
    useCreateGradeMutation()
  const { mutateAsync: updateGrade, isPending: isUpdating } =
    useUpdateGradeMutation()
  const { mutateAsync: deleteGrade, isPending: isDeleting } =
    useDeleteGradeMutation()

  const isLoading = isGradesLoading || isSubjectsLoading

  const handleSubmitGrade = (data: any) => {
    const isEdit = !!editingGrade
    const promise = isEdit
      ? updateGrade({ id: editingGrade.id, data })
      : createGrade(data)

    toast.promise(promise, {
      loading: isEdit ? 'Updating grade...' : 'Saving grade...',
      success: () => {
        setIsAddOpen(false)
        setEditingGrade(null)
        return isEdit
          ? 'Grade updated successfully'
          : 'Grade recorded successfully'
      },
      error: (err: any) => {
        const backendError = err.response?.data
        return (
          backendError?.message ||
          `Failed to ${isEdit ? 'update' : 'save'} grade`
        )
      },
    })
  }

  const handleDeleteGrade = () => {
    if (!deleteId) return
    toast.promise(deleteGrade(deleteId), {
      loading: 'Deleting grade...',
      success: () => {
        setDeleteId(null)
        return 'Grade deleted successfully'
      },
      error: 'Failed to delete grade',
    })
  }

  const columns: Array<ColumnDef<Grade>> = [
    {
      accessorKey: 'student.fullName',
      header: 'Student Name',
      cell: ({ row }) => {
        const studentName = row.original.student?.fullName
        const matricNumber = row.original.studentNumber

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {studentName || matricNumber || 'Unknown Student'}
            </span>
            {studentName && matricNumber && (
              <span className="text-xs text-muted-foreground">
                {matricNumber}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'assessment.name',
      header: 'Assessment',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.assessment?.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.assessment?.subjectId.code}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.original.score
        const maxScore = row.original.assessment?.maxScore || 100
        const percentage = (score / maxScore) * 100

        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{score}</span>
            <span className="text-muted-foreground text-xs">/ {maxScore}</span>
            <Badge
              variant={percentage >= 50 ? 'secondary' : 'destructive'}
              className="ml-2 text-[10px]"
            >
              {Math.round(percentage)}%
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'assessment.weight',
      header: 'Weight',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.assessment?.weight}%
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => {
              setEditingGrade(row.original)
              setIsAddOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={FileText}
        title="Manage Grades"
        description="Input and review student scores for assessments."
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border shadow-sm">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Filter by:
              </span>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="h-8 w-[200px] border-none bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="rounded-xl h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Grade
            </Button>
          </div>
        }
      />

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Grade Records</span>
            {selectedSubject !== 'all' && (
              <Badge variant="outline" className="font-normal capitalize">
                {subjects?.find((s) => s.id === selectedSubject)?.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-destructive/50 bg-destructive/5">
              <p className="text-sm font-medium text-destructive">
                Failed to load grade records. Please try again.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={grades || []}
              emptyMessage="No grade records found."
            />
          )}
        </CardContent>
      </Card>

      <GradeFormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) setEditingGrade(null)
        }}
        initialData={editingGrade}
        onSubmit={handleSubmitGrade}
        isPending={isCreating || isUpdating}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              student's score for this assessment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              onClick={handleDeleteGrade}
              disabled={isDeleting}
            >
              Delete Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
