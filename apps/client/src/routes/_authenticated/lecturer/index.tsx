import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
} from 'lucide-react'

import { useSubjectsQuery } from '@/hooks/queries/subjects.queries'
import { useAssessmentsQuery } from '@/hooks/queries/assessments.queries'
import { useGradesQuery } from '@/hooks/queries/grades.queries'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/lecturer/dashboard-stats'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/lecturer/')({
  component: LecturerDashboard,
})

function LecturerDashboard() {
  const { data: subjects, isLoading: isSubjectsLoading } = useSubjectsQuery()
  const { data: assessments, isLoading: isAssessmentsLoading } =
    useAssessmentsQuery()
  const { data: grades, isLoading: isGradesLoading } = useGradesQuery()

  const stats = [
    {
      title: 'Total Subjects',
      value: subjects?.length || 0,
      icon: BookOpen,
      description: 'Subjects you are teaching',
    },
    {
      title: 'Active Assessments',
      value: assessments?.length || 0,
      icon: ClipboardList,
      description: 'Total assessments created',
    },
    {
      title: 'Grades Recorded',
      value: grades?.length || 0,
      icon: GraduationCap,
      description: 'Total student scores recorded',
    },
    {
      title: 'Completion Rate',
      value: stats_calc_completion(grades, assessments),
      icon: TrendingUp,
      description: 'Overall grading progress',
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={LayoutDashboard}
        title="Lecturer Dashboard"
        description="Overview of your academic activities and grading progress."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            {...stat}
            className="border-none shadow-sm bg-background/50 backdrop-blur-sm"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Quick Actions */}
        <Card className="lg:col-span-1 border-none shadow-sm bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full justify-start rounded-xl h-12 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all border-none shadow-none"
            >
              <Link to="/lecturer/subjects">
                <BookOpen className="mr-3 h-5 w-5" />
                Manage Subjects
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start rounded-xl h-12 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all border-none shadow-none"
            >
              <Link to="/lecturer/assessment">
                <PlusCircle className="mr-3 h-5 w-5" />
                Create Assessment
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start rounded-xl h-12 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all border-none shadow-none"
            >
              <Link to="/lecturer/manage-grades">
                <ClipboardList className="mr-3 h-5 w-5" />
                Input Grades
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Subjects Overview */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Subjects</CardTitle>
            <CardDescription>
              Overview of subjects you are currently managing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isSubjectsLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading subjects...
                </p>
              ) : subjects?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subjects found.
                </p>
              ) : (
                subjects?.slice(0, 5).map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {subject.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {subject.code}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-lg font-normal"
                    >
                      {assessments?.filter(
                        (a) =>
                          a.subjectId === subject.id ||
                          (a.subjectId as any).id === subject.id,
                      ).length || 0}{' '}
                      Assessments
                    </Badge>
                  </div>
                ))
              )}
              {subjects && subjects.length > 5 && (
                <Button
                  variant="link"
                  asChild
                  className="p-0 h-auto text-sm text-primary"
                >
                  <Link to="/lecturer/subjects">View all subjects</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function stats_calc_completion(
  grades: Array<any> | undefined,
  assessments: Array<any> | undefined,
) {
  if (!grades || !assessments || assessments.length === 0) return '0%'
  // Simple heuristic: percentage of grades compared to a rough estimate of expected grades
  // For a real app, we'd need enrollment counts per subject
  const totalWeight = assessments.reduce((acc, a) => acc + (a.weight || 0), 0)
  const averageWeight = totalWeight / assessments.length

  // This is just a placeholder logic for the dashboard visual
  const percentage = Math.min(
    Math.round((grades.length / (assessments.length * 10)) * 100),
    100,
  )
  return `${percentage}%`
}
