import { PostmanUser } from "@/types/postman-user-type"
import { SavedWorkspace } from "@/types/saved-workspace-type"
import { SortingState } from "@tanstack/react-table"

export type SortOrder = 'custom' | 'asc' | 'desc';
export type InputType = 'url' | 'id';

export interface WorkspaceState {
  // Global & Auth
  workspaceId: string
  savedWorkspaces: SavedWorkspace[]
  hasHydrated: boolean
  sortOrder: SortOrder
  inputValue: string
  inputType: InputType
  typePopoverOpen: boolean
  isLoadingWorkspace: boolean
  tableSorting: SortingState
  tableRowSelection: Record<string, boolean>
  downloadingId: string | null
  isBulkDownloading: boolean
  editWorkspaceLabel: string
  settingsShowKey: boolean
  settingsDraftApiKey: string
  settingsIsValidating: boolean
  quickSelectOpen: boolean
  editingWorkspace: SavedWorkspace | null

  // Actions
  setWorkspaceId: (id: string) => void
  setHasHydrated: (state: boolean) => void
  setSortOrder: (order: SortOrder) => void
  setInputValue: (value: string) => void
  setInputType: (type: InputType) => void
  setTypePopoverOpen: (open: boolean) => void
  setIsLoadingWorkspace: (loading: boolean) => void
  setTableSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void
  setTableRowSelection: (updater: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => void
  setDownloadingId: (id: string | null) => void
  setIsBulkDownloading: (isDownloading: boolean) => void
  setEditWorkspaceLabel: (label: string) => void
  setSettingsShowKey: (show: boolean) => void
  setSettingsDraftApiKey: (key: string) => void
  setSettingsIsValidating: (validating: boolean) => void
  setQuickSelectOpen: (open: boolean) => void
  setEditingWorkspace: (workspace: SavedWorkspace | null) => void
  reorderWorkspaces: (startIndex: number, endIndex: number) => void

  addSavedWorkspace: (workspace: SavedWorkspace) => void
  removeSavedWorkspace: (id: string) => void
  updateSavedWorkspace: (id: string, newLabel: string) => void
  resetWorkspaceName: (id: string) => void

  // New: Smart Action to load and save
  loadWorkspace: (id: string) => Promise<void>
}
