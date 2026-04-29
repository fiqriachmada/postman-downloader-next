import { SavedWorkspace } from "@/types/saved-workspace-type"

export interface EditWorkspaceDialogProps {
  workspace: SavedWorkspace | null
  onClose: () => void
}
