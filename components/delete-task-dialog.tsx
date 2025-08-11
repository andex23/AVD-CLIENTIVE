"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTasks } from "@/hooks/use-tasks"
import type { Task } from "@/types/task"

interface DeleteTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTaskDialog({ task, open, onOpenChange }: DeleteTaskDialogProps) {
  const { deleteTask } = useTasks()

  const handleDelete = () => {
    deleteTask(task.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
