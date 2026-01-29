import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Award,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Info,
  LayoutDashboard,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

import type { Grade } from '@/hooks/api/grades.api'
import type { Subject } from '@/hooks/api/subjects.api'
import { useAuth } from '@/auth/auth-store'
import { useMyGpaQuery, useMyGradesQuery } from '@/hooks/queries/grades.queries'
import { useEnrolledSubjectsQuery } from '@/hooks/queries/subjects.queries'
import { useMeQuery } from '@/hooks/queries/user.queries'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Reusable components
import { PageHeader } from '@/components/layout/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import ChartLineDots from '@/components/line-chart'
import type { ChartConfig } from '@/components/ui/chart'

export const Route = createFileRoute('/_authenticated/student/')({
  component: StudentDashboard,
})

function StudentDashboard() {
  const { user } = useAuth()

  const {
    data: grades,
    isLoading: isLoadingGrades,
    refetch: refetchGrades,
  } = useMyGradesQuery()
  const {
    data: gpa,
    isLoading: isLoadingGpa,
    refetch: refetchGpa,
  } = useMyGpaQuery()
  const {
    data: enrolledSubjects,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useEnrolledSubjectsQuery()

  const { refetch: refetchMe } = useMeQuery()

  const [selectedSubject, setSelectedSubject] = React.useState<{
    id: string
    name: string
    code: string
  } | null>(null)

  const handleRefresh = React.useCallback(() => {
    refetchGrades()
    refetchGpa()
    refetchSubjects()
    refetchMe()
  }, [refetchGrades, refetchGpa, refetchSubjects, refetchMe])

  // Calculate average score
  const averageScore = React.useMemo(() => {
    if (!grades || grades.length === 0) return 0
    const sum = grades.reduce((acc, curr) => acc + curr.score, 0)
    return Math.round((sum / grades.length) * 10) / 10
  }, [grades])

  const performanceTrendData = React.useMemo(() => {
    if (!grades || grades.length === 0) return []
    return [...grades]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((grade) => {
        const assessmentName =
          typeof grade.assessmentId === 'object'
            ? grade.assessmentId.name
            : 'Assessment'
        const date = new Date(grade.createdAt)
        return {
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          assessment: assessmentName,
          score: grade.score,
          fullDate: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      })
  }, [grades])

  const performanceTrendConfig = {
    score: {
      label: 'Score',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-6 p-4">
      <PageHeader
        icon={LayoutDashboard}
        title="Academic Overview"
        description={`Welcome back, ${user?.fullName}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={TrendingUp}
          isLoading={isLoadingGrades}
          colorClass="text-primary"
          bgIconColorClass="bg-primary/10"
        />
        <StatsCard
          title="Assessments Completed"
          value={grades?.length || 0}
          icon={Award}
          isLoading={isLoadingGrades}
          colorClass="text-secondary"
          bgIconColorClass="bg-secondary/10"
        />
        <StatsCard
          title="GPA (Est.)"
          value={gpa?.gpa.toFixed(2) || '0.00'}
          icon={BookOpen}
          isLoading={isLoadingGpa}
          colorClass="text-primary"
          bgIconColorClass="bg-primary/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your academic progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] border-t p-0">
            {isLoadingGrades ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[250px] w-[90%]" />
              </div>
            ) : !performanceTrendData || performanceTrendData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 opacity-20" />
                <p className="max-w-[200px] text-sm italic">
                  No performance data available yet.
                </p>
              </div>
            ) : (
              <ChartLineDots
                data={performanceTrendData}
                config={performanceTrendConfig}
                xDataKey="date"
                lineDataKey="score"
              />
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest assessment results</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingGrades ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !grades || grades.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
                <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-900">
                  <Info className="h-10 w-10 opacity-20" />
                </div>
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y">
                {grades.slice(0, 5).map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        {typeof grade.assessmentId === 'object'
                          ? grade.assessmentId.name
                          : 'Assessment'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {typeof grade.assessmentId === 'object' &&
                        typeof grade.assessmentId.subjectId === 'object'
                          ? grade.assessmentId.subjectId.name
                          : 'Subject'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold">{grade.score}%</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
          <CardDescription>Subject enrollment and performance</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t">
          {isLoadingSubjects ? (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !enrolledSubjects || enrolledSubjects.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
              <BookOpen className="h-10 w-10 opacity-20" />
              <p className="text-sm">No subjects enrolled yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledSubjects.map((enrollment) => {
                const subject =
                  enrollment.subject ||
                  (typeof enrollment.subjectId === 'object'
                    ? enrollment.subjectId
                    : null)

                if (!subject) return null

                return (
                  <button
                    key={enrollment.id}
                    onClick={() =>
                      setSelectedSubject({
                        id: subject.id,
                        name: subject.name,
                        code: subject.code,
                      })
                    }
                    className="group relative flex flex-col text-left rounded-xl border p-4 hover:border-blue-500/50 hover:bg-blue-50/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {subject.code}
                        </p>
                        <h3 className="font-semibold text-sm leading-tight">
                          {subject.name}
                        </h3>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <BookOpen className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-xs w-full">
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Enrolled</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SubjectAssessmentsModal
        subject={selectedSubject}
        grades={grades || []}
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  )
}

interface SubjectAssessmentsModalProps {
  subject: Subject | { id: string; name: string; code: string } | null
  grades: Array<Grade>
  isOpen: boolean
  onClose: () => void
}

function SubjectAssessmentsModal({
  subject,
  grades,
  isOpen,
  onClose,
}: SubjectAssessmentsModalProps) {
  const subjectGrades = React.useMemo(() => {
    if (!subject) return []
    return grades.filter((g) => {
      const gSubject =
        typeof g.assessmentId === 'object' &&
        typeof g.assessmentId.subjectId === 'object'
          ? g.assessmentId.subjectId
          : null

      if (!gSubject) return false

      const gSubjectId = gSubject.id || (gSubject as any)._id
      return gSubjectId === subject.id
    })
  }, [subject, grades])

  const { totalScore, totalWeight } = React.useMemo(() => {
    let total = 0
    let weightSum = 0

    subjectGrades.forEach((g) => {
      const assessment = g.assessmentId
      if (typeof assessment === 'object') {
        const weight = assessment.weight || 0
        const maxScore = assessment.maxScore || 100
        const score = g.score || 0
        total += (score / maxScore) * weight
        weightSum += weight
      }
    })

    return {
      totalScore: Math.round(total * 100) / 100,
      totalWeight: weightSum,
    }
  }, [subjectGrades])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200"
            >
              {subject?.code}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{subject?.name}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of your assessments and overall performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="rounded-xl border bg-slate-50/50 p-4 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Overall Performance
              </span>
              <span className="text-lg font-bold text-primary">
                {totalScore}%
              </span>
            </div>
            <Progress value={totalScore} className="h-2" />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Based on {subjectGrades.length} recorded assessments (Total
              weight: {totalWeight}%)
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Assessments
            </h4>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
              {subjectGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  <p className="text-sm italic">
                    No grades recorded for this subject yet.
                  </p>
                </div>
              ) : (
                subjectGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {typeof grade.assessmentId === 'object'
                          ? grade.assessmentId.name
                          : 'Assessment'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Weight:{' '}
                        {typeof grade.assessmentId === 'object'
                          ? grade.assessmentId.weight
                          : 0}
                        % • Max:{' '}
                        {typeof grade.assessmentId === 'object'
                          ? grade.assessmentId.maxScore
                          : 100}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {grade.score}/
                        {typeof grade.assessmentId === 'object'
                          ? grade.assessmentId.maxScore
                          : 100}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {Math.round(
                          (grade.score /
                            (typeof grade.assessmentId === 'object'
                              ? grade.assessmentId.maxScore
                              : 100)) *
                            100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
