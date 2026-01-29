import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Subject {
  id: string
  name: string
  code: string
  createdAt?: string
}

interface SubjectCardProps {
  subject: Subject
  index: number
  variant: 'lecturer' | 'student'
  isEnrolled?: boolean
  isActionPending?: boolean
  onEdit?: (subject: Subject) => void
  onDelete?: (subject: Subject) => void
  onEnroll?: (subjectId: string, subjectName: string) => void
}

export function SubjectCard({
  subject,
  index,
  variant,
  isEnrolled,
  isActionPending,
  onEdit,
  onDelete,
  onEnroll,
}: SubjectCardProps) {
  const isLecturer = variant === 'lecturer'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`group relative h-full flex flex-col overflow-hidden border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl py-0`}
      >
        <CardHeader className={`relative overflow-hidden bg-primary/5 py-3`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-24 w-24" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {subject.code}
              </Badge>
              {isEnrolled && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-none shadow-sm flex gap-1 items-center">
                  <CheckCircle2 className="h-3 w-3" />
                  Enrolled
                </Badge>
              )}
            </div>
            <CardTitle
              className={`text-xl font-bold line-clamp-2 min-h-14 tracking-tight group-hover:text-primary transition-colors`}
            >
              {subject.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-2">
              Course overview and syllabus details for {subject.name}.
            </p>
            {subject.createdAt && (
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  Created {new Date(subject.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-3">
          {isLecturer ? (
            <>
              <Button
                variant="outline"
                className={`flex-1 rounded-xl h-10 gap-2 border-border hover:bg-accent hover:text-primary hover:border-primary/50 transition-all font-medium`}
                onClick={() => onEdit?.(subject)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-medium"
                onClick={() => onDelete?.(subject)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          ) : (
            <Button
              className={`w-full h-12 rounded-xl text-md font-semibold gap-2 transition-all duration-300 shadow-sm ${
                isEnrolled
                  ? 'bg-muted hover:bg-accent text-muted-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-95'
              }`}
              variant={isEnrolled ? 'secondary' : 'default'}
              disabled={isEnrolled || isActionPending}
              onClick={() => onEnroll?.(subject.id, subject.name)}
            >
              {isEnrolled ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Active Enrollment
                </>
              ) : isActionPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Enroll in Course'
              )}
            </Button>
          )}
        </CardFooter>

        {(!isEnrolled || isLecturer) && (
          <div
            className={`absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
          />
        )}
      </Card>
    </motion.div>
  )
}
