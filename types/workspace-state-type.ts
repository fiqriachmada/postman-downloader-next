import { PostmanUser } from "@/types/postman-user-type"
import { SavedWorkspace } from "@/types/saved-workspace-type"
import { SortingState } from "@tanstack/react-table"

export type SortOrder = 'custom' | 'asc' | 'desc';

export interface WorkspaceState {
  // Persistent State
  workspaceId: string
  savedWorkspaces: SavedWorkspace[]
  hasHydrated: boolean
  sortOrder: SortOrder

  // Shared Table State
  tableSorting: SortingState
  tableRowSelection: Record<string, boolean>
  downloadingId: string | null
  isBulkDownloading: boolean

  // UI Shared State
  quickSelectOpen: boolean
  editingWorkspace: SavedWorkspace | null

  // Actions
  setWorkspaceId: (id: string) => void
  setHasHydrated: (state: boolean) => void
  setSortOrder: (order: SortOrder) => void
  setTableSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  setTableRowSelection: (updater: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => void
  setDownloadingId: (id: string | null) => void
  setIsBulkDownloading: (isDownloading: boolean) => void
  setQuickSelectOpen: (open: boolean) => void
  setEditingWorkspace: (workspace: SavedWorkspace | null) => void
  reorderWorkspaces: (startIndex: number, endIndex: number) => void

  addSavedWorkspace: (workspace: SavedWorkspace) => void
  removeSavedWorkspace: (id: string) => void
  updateSavedWorkspace: (id: string, newLabel: string) => void
  resetWorkspaceName: (id: string) => void
  clearAllWorkspaces: () => void

  // Smart Action: fetch workspace name and persist to saved list
  loadWorkspace: (id: string) => Promise<void>
}
