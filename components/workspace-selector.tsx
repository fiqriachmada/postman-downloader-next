"use client"

import { WorkspaceInput } from "./workspace-input"
import { QuickSelect } from "./quick-select"
import { EditWorkspaceDialog } from "./edit-workspace-dialog"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function WorkspaceSelector() {
  const { editingWorkspace, setEditingWorkspace } = useWorkspaceStore()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* 1. Input Section */}
      <WorkspaceInput />

      {/* 2. Selection Section */}
      <QuickSelect onEdit={setEditingWorkspace} />

      {/* 3. Dialogs Section */}
      <EditWorkspaceDialog
        workspace={editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
      />
    </div>
  )
}
