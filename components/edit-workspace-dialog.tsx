"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWorkspaceStore } from "@/stores/workspace-store"

import { toast } from "sonner"

import { EditWorkspaceDialogProps } from "@/types/edit-workspace-dialog-props-type"

export function EditWorkspaceDialog({
  workspace,
  onClose,
}: EditWorkspaceDialogProps) {
  const {
    editWorkspaceLabel: newLabel,
    setEditWorkspaceLabel: setNewLabel,
    updateSavedWorkspace,
  } = useWorkspaceStore()

  const handleSave = () => {
    if (workspace && newLabel.trim()) {
      updateSavedWorkspace(workspace.id, newLabel.trim())
      toast.success("Workspace renamed")
      onClose()
    }
  }

  const handleReset = () => {
    if (workspace) {
      const original = workspace.originalLabel || workspace.label
      setNewLabel(original)
      toast.info("Reset to original name")
    }
  }

  return (
    <Dialog open={!!workspace} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Workspace Name</DialogTitle>
          <DialogDescription>
            Change the display name for this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter workspace name..."
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          {workspace?.originalLabel && newLabel !== workspace.originalLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 w-full gap-2 border-dashed text-xs text-muted-foreground transition-all hover:border-solid"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to original:{" "}
              <span className="font-semibold">{workspace.originalLabel}</span>
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
