import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { fetchWorkspace } from "@/lib/api"
import { WorkspaceState } from "@/types/workspace-state-type"
import { useUserProfileStore } from "./user-profile-store"

let loadWorkspaceRequestSeq = 0

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaceId: "",
      savedWorkspaces: [],
      hasHydrated: false,
      sortOrder: "custom",
      inputValue: "",
      inputType: "url",
      typePopoverOpen: false,
      isLoadingWorkspace: false,
      tableSorting: [],
      tableRowSelection: {},
      downloadingId: null,
      isBulkDownloading: false,
      editWorkspaceLabel: "",
      settingsShowKey: false,
      settingsDraftApiKey: "",
      settingsIsValidating: false,
      quickSelectOpen: false,
      editingWorkspace: null,

      setWorkspaceId: (id) => set({ workspaceId: id }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setInputValue: (val) => set({ inputValue: val }),
      setInputType: (val) => set({ inputType: val }),
      setTypePopoverOpen: (val) => set({ typePopoverOpen: val }),
      setIsLoadingWorkspace: (val) => set({ isLoadingWorkspace: val }),
      setTableSorting: (updater) =>
        set((state) => ({
          tableSorting:
            typeof updater === "function"
              ? updater(state.tableSorting)
              : updater,
        })),
      setTableRowSelection: (updater) =>
        set((state) => ({
          tableRowSelection:
            typeof updater === "function"
              ? updater(state.tableRowSelection)
              : updater,
        })),
      setDownloadingId: (id) => set({ downloadingId: id }),
      setIsBulkDownloading: (val) => set({ isBulkDownloading: val }),
      setEditWorkspaceLabel: (label) => set({ editWorkspaceLabel: label }),
      setSettingsShowKey: (val) => set({ settingsShowKey: val }),
      setSettingsDraftApiKey: (val) => set({ settingsDraftApiKey: val }),
      setSettingsIsValidating: (val) => set({ settingsIsValidating: val }),
      setQuickSelectOpen: (val) => set({ quickSelectOpen: val }),
      setEditingWorkspace: (val) => set({ editingWorkspace: val }),
      reorderWorkspaces: (startIndex, endIndex) =>
        set((state) => {
          const newWorkspaces = Array.from(state.savedWorkspaces)
          const [removed] = newWorkspaces.splice(startIndex, 1)
          newWorkspaces.splice(endIndex, 0, removed)
          return { savedWorkspaces: newWorkspaces, sortOrder: "custom" }
        }),

      addSavedWorkspace: (workspace) => {
        const { savedWorkspaces } = get()
        if (savedWorkspaces.some((w) => w.id === workspace.id)) return

        set({
          savedWorkspaces: [
            ...savedWorkspaces,
            { ...workspace, originalLabel: workspace.label },
          ],
        })
      },

      removeSavedWorkspace: (id) =>
        set((state) => ({
          savedWorkspaces: state.savedWorkspaces.filter((w) => w.id !== id),
        })),

      updateSavedWorkspace: (id, newLabel) =>
        set((state) => ({
          savedWorkspaces: state.savedWorkspaces.map((w) =>
            w.id === id ? { ...w, label: newLabel } : w
          ),
        })),

      resetWorkspaceName: (id) =>
        set((state) => ({
          savedWorkspaces: state.savedWorkspaces.map((w) =>
            w.id === id ? { ...w, label: w.originalLabel || w.label } : w
          ),
        })),

      // Integrated Logic to prevent loops
      loadWorkspace: async (id: string) => {
        const requestId = ++loadWorkspaceRequestSeq
        const { savedWorkspaces, setWorkspaceId, addSavedWorkspace } = get()
        const apiKey = useUserProfileStore.getState().apiKey

        // 1. Set the ID immediately
        setWorkspaceId(id)

        // 2. If no ID or no API Key, stop
        if (!id || !apiKey) return

        // 3. If already saved, stop
        if (savedWorkspaces.some((w) => w.id === id)) return

        // 4. Fetch name and save
        try {
          const workspace = await fetchWorkspace(id, apiKey)
          // Ignore stale async results when user switched workspace quickly.
          if (requestId !== loadWorkspaceRequestSeq) return

          if (workspace && workspace.name) {
            addSavedWorkspace({ id, label: workspace.name })
          }
        } catch (err) {
          console.error("Failed to auto-save workspace:", err)
        }
      },
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        savedWorkspaces: state.savedWorkspaces,
        sortOrder: state.sortOrder,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("workspace-storage-old") // Optional cleanup if needed
        }
        state?.setHasHydrated(true)
      },
    }
  )
)
