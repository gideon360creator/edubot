import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Library } from 'lucide-react'
import { toast } from 'sonner'

import {
  useEnrolledSubjectsQuery,
  useRegisterSubjectMutation,
  useSubjectsQuery,
} from '@/hooks/queries/subjects.queries'

import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Reusable components
import { PageHeader } from '@/components/layout/page-header'
import { SearchSection } from '@/components/shared/search-section'
import { EmptyState } from '@/components/shared/empty-state'
import { SubjectCard } from '@/components/subjects/subject-card'

export const Route = createFileRoute('/_authenticated/student/subjects')({
  component: StudentSubjects,
})

function StudentSubjects() {
  const [search, setSearch] = React.useState('')

  const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsQuery()
  const { data: enrolledSubjects, isLoading: isLoadingEnrolled } =
    useEnrolledSubjectsQuery()
  const { mutateAsync: register, isPending: isRegistering } =
    useRegisterSubjectMutation()

  const enrolledIds = React.useMemo(() => {
    if (!enrolledSubjects) return new Set<string>()
    return new Set(
      enrolledSubjects
        .map((e) => {
          if (typeof e.subjectId === 'string') return e.subjectId
          return e.subject?.id || ''
        })
        .filter((id) => !!id),
    )
  }, [enrolledSubjects])

  const filteredSubjects = React.useMemo(() => {
    if (!subjects) return []
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()),
    )
  }, [subjects, search])

  const handleEnroll = (subjectId: string, subjectName: string) => {
    toast.promise(register(subjectId), {
      loading: `Enrolling in ${subjectName}...`,
      success: () => `Successfully enrolled in ${subjectName}`,
      error: (error: any) => error.message || 'Failed to enroll in subject',
    })
  }

  const isLoading = isLoadingSubjects || isLoadingEnrolled

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={Library}
        title="Subject Enrollment"
        description="Expand your knowledge and advance your academic journey by enrolling in available subjects."
        iconColorClass="text-blue-600"
        bgIconColorClass="bg-blue-500/10"
      />

      <SearchSection
        placeholder="Search by subject name or code..."
        search={search}
        onSearchChange={setSearch}
        focusColorClass="focus:ring-primary"
        badges={
          <>
            <Badge variant="outline" className="h-7 px-3 rounded-full">
              {subjects?.length || 0} Total Subjects
            </Badge>
            <Badge
              variant="secondary"
              className="h-7 px-3 rounded-full bg-secondary/10 text-secondary"
            >
              {enrolledIds.size} Enrolled
            </Badge>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects found"
          onClear={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={index}
              variant="student"
              isEnrolled={enrolledIds.has(subject.id)}
              isActionPending={isRegistering}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </div>
  )
}
