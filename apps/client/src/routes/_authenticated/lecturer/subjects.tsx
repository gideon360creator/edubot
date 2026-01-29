import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Library, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useSubjectsQuery,
  useUpdateSubjectMutation,
} from '@/hooks/queries/subjects.queries'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// Reusable components
import { PageHeader } from '@/components/layout/page-header'
import { SearchSection } from '@/components/shared/search-section'
import { EmptyState } from '@/components/shared/empty-state'
import { SubjectCard } from '@/components/subjects/subject-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { SubjectFormDialog } from '@/components/subjects/subject-form-dialog'

export const Route = createFileRoute('/_authenticated/lecturer/subjects')({
  component: LecturerSubjects,
})

function LecturerSubjects() {
  const [search, setSearch] = React.useState('')
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedSubject, setSelectedSubject] = React.useState<{
    id: string
    name: string
    code: string
  } | null>(null)

  const { data: subjects, isLoading } = useSubjectsQuery()
  const { mutateAsync: createSubject, isPending: isCreating } =
    useCreateSubjectMutation()
  const { mutateAsync: updateSubject, isPending: isUpdating } =
    useUpdateSubjectMutation()
  const { mutateAsync: deleteSubject, isPending: isDeleting } =
    useDeleteSubjectMutation()

  const filteredSubjects = React.useMemo(() => {
    if (!subjects) return []
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()),
    )
  }, [subjects, search])

  const handleAddSubject = (
    e: React.FormEvent,
    data: { name: string; code: string },
  ) => {
    e.preventDefault()
    if (!data.name || !data.code) return

    toast.promise(createSubject(data), {
      loading: 'Creating subject...',
      success: () => {
        setIsAddOpen(false)
        return 'Subject created successfully'
      },
      error: (err: any) => err.message || 'Failed to create subject',
    })
  }

  const handleEditSubject = (
    e: React.FormEvent,
    data: { name: string; code: string },
  ) => {
    e.preventDefault()
    if (!selectedSubject || !data.name || !data.code) return

    toast.promise(updateSubject({ id: selectedSubject.id, data }), {
      loading: 'Updating subject...',
      success: () => {
        setIsEditOpen(false)
        setSelectedSubject(null)
        return 'Subject updated successfully'
      },
      error: (err: any) => err.message || 'Failed to update subject',
    })
  }

  const handleDeleteSubject = () => {
    if (!selectedSubject) return

    toast.promise(deleteSubject(selectedSubject.id), {
      loading: 'Deleting subject...',
      success: () => {
        setIsDeleteOpen(false)
        setSelectedSubject(null)
        return 'Subject deleted successfully'
      },
      error: (err: any) => err.message || 'Failed to delete subject',
    })
  }

  const openEdit = (subject: any) => {
    setSelectedSubject(subject)
    setIsEditOpen(true)
  }

  const openDelete = (subject: any) => {
    setSelectedSubject(subject)
    setIsDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 p-4 animate-in fade-in duration-500">
      <PageHeader
        icon={Library}
        title="Manage Subjects"
        description="Create, update, and manage academic subjects for your students."
        action={
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </Button>
        }
      />
      <SearchSection
        placeholder="Search by subject name or code..."
        search={search}
        onSearchChange={setSearch}
        focusColorClass="focus:ring-primary"
        badges={
          <Badge variant="outline" className="h-7 px-3 rounded-full">
            {subjects?.length || 0} Total Subjects
          </Badge>
        }
      />
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No subjects found"
          description={
            search
              ? `We couldn't find any subjects matching "${search}"`
              : "You haven't created any subjects yet."
          }
          onClear={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={index}
              variant="lecturer"
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}
      {/* Add Dialog */}
      <SubjectFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Subject"
        description="Enter the details of the new subject you want to create."
        submitText="Create Subject"
        isPending={isCreating}
        onSubmit={handleAddSubject}
      />
      {/* Edit Dialog */}
      <SubjectFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Subject"
        description={`Update the details for "${selectedSubject?.name}".`}
        submitText="Save Changes"
        isPending={isUpdating}
        initialData={React.useMemo(
          () =>
            selectedSubject
              ? { name: selectedSubject.name, code: selectedSubject.code }
              : undefined,
          [selectedSubject],
        )}
        onSubmit={handleEditSubject}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Subject"
        description={`Are you sure you want to delete ${selectedSubject?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteSubject}
        isPending={isDeleting}
        confirmText="Yes, Delete Subject"
      />
    </div>
  )
}
