import * as React from 'react'
import { Users } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { EnrolledStudent } from '@/hooks/api/user.api'
import { useEnrolledStudentsQuery } from '@/hooks/queries/user.queries'
import { useSubjectsQuery } from '@/hooks/queries/subjects.queries'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { SubjectFilter } from '@/components/filters/subject-filter'

export const Route = createFileRoute(
  '/_authenticated/lecturer/registered-users',
)({
  component: RegisteredUsersPage,
})

const columns: Array<ColumnDef<EnrolledStudent>> = [
  {
    accessorKey: 'student.fullName',
    header: 'Student Name',
    cell: ({ row }) => {
      const student = row.original.student
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {student.fullName}
          </span>
          <span className="text-sm text-muted-foreground">
            @{student.username}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'student.studentNumber',
    header: 'Matriculation Number',
    cell: ({ row }) => {
      return (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {row.original.student.studentNumber || 'N/A'}
        </code>
      )
    },
  },
  {
    accessorKey: 'subject.name',
    header: 'Subject',
    cell: ({ row }) => {
      const subject = row.original.subject
      return (
        <div className="flex flex-col">
          <span className="font-medium">{subject.name}</span>
          <div className="mt-1">
            <Badge
              variant="secondary"
              className="text-[10px] uppercase font-bold tracking-wider"
            >
              {subject.code}
            </Badge>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'enrolledAt',
    header: 'Enrolled On',
    cell: ({ row }) => {
      const date = new Date(row.original.enrolledAt)
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(date)}
        </span>
      )
    },
  },
]

function RegisteredUsersPage() {
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all')

  const {
    data: students,
    isLoading: isStudentsLoading,
    error,
  } = useEnrolledStudentsQuery(
    selectedSubject === 'all' ? undefined : selectedSubject,
  )

  const { data: subjects, isLoading: isSubjectsLoading } = useSubjectsQuery()

  const isLoading = isStudentsLoading || isSubjectsLoading

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={Users}
        title="Registered Students"
        description="A list of all students enrolled in your subjects."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <SubjectFilter
              value={selectedSubject}
              onChange={setSelectedSubject}
              subjects={subjects}
              label="Filter by:"
              selectTriggerClassName="sm:w-[200px]"
            />
          </div>
        }
      />

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Enrollment Details</span>
            {selectedSubject !== 'all' && (
              <Badge variant="outline" className="font-normal">
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-destructive/50 bg-destructive/5">
              <p className="text-sm font-medium text-destructive">
                Failed to load enrolled students. Please try again.
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={students || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
