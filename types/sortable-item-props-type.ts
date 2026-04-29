import * as React from "react"
import { SavedWorkspace } from "@/types/saved-workspace-type"

export interface SortableItemProps {
  workspace: SavedWorkspace
  isActive: boolean
  onSelect: () => void
  onEdit: (workspace: SavedWorkspace) => void
  onDelete: (e: React.MouseEvent | React.PointerEvent, id: string) => void
}
