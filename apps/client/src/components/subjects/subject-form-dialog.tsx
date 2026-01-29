import * as React from 'react'
import { Loader2 } from 'lucide-react'
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

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (e: React.FormEvent, data: { name: string; code: string }) => void
  initialData?: { name: string; code: string }
  isPending?: boolean
  submitText?: string
}

const DEFAULT_DATA = { name: '', code: '' }

export function SubjectFormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  initialData = DEFAULT_DATA,
  isPending,
  submitText = 'Submit',
}: SubjectFormDialogProps) {
  const [formData, setFormData] = React.useState(initialData)

  React.useEffect(() => {
    if (open) {
      setFormData(initialData)
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              placeholder="e.g. CS101"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="rounded-xl border-border focus:ring-primary px-4 h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g. Introduction to Computer Science"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-xl border-border focus:ring-primary px-4 h-11"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90"
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
