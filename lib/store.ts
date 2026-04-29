import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { fetchWorkspace } from "./api"
import { PostmanUser } from "@/types/postman-user-type"

export interface SavedWorkspace {
  id: string
  label: string
  originalLabel?: string
}

interface WorkspaceState {
  workspaceId: string
  apiKey: string
  encodedApiKey: string
  userProfile: PostmanUser | null
  savedWorkspaces: SavedWorkspace[]
  hasHydrated: boolean

  // Actions
  setWorkspaceId: (id: string) => void
  setApiKey: (key: string) => void
  login: (key: string, profile: PostmanUser) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void

  addSavedWorkspace: (workspace: SavedWorkspace) => void
  removeSavedWorkspace: (id: string) => void
  updateSavedWorkspace: (id: string, newLabel: string) => void
  resetWorkspaceName: (id: string) => void

  // New: Smart Action to load and save
  loadWorkspace: (id: string) => Promise<void>
}

let loadWorkspaceRequestSeq = 0

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaceId: "",
      apiKey: "",
      encodedApiKey: "",
      userProfile: null,
      savedWorkspaces: [],
      hasHydrated: false,

      setWorkspaceId: (id) => set({ workspaceId: id }),
      setApiKey: (key) => set({ apiKey: key, encodedApiKey: btoa(key) }),
      login: (key, profile) =>
        set({
          apiKey: key,
          encodedApiKey: btoa(key),
          userProfile: profile,
        }),
      logout: () =>
        set({
          userProfile: null,
          // Keep encodedApiKey for re-validation later
        }),
      setHasHydrated: (state) => set({ hasHydrated: state }),

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
        const { apiKey, savedWorkspaces, setWorkspaceId, addSavedWorkspace } =
          get()

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
      name: "postman-downloader-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        encodedApiKey: state.encodedApiKey,
        userProfile: state.userProfile,
        savedWorkspaces: state.savedWorkspaces,
      }),
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...persistedState }
        if (merged.userProfile && merged.encodedApiKey) {
          try {
            merged.apiKey = atob(merged.encodedApiKey)
          } catch (e) {
            merged.apiKey = ""
          }
        }
        return merged
      },
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("workspace-storage")
        }
        state?.setHasHydrated(true)
      },
    }
  )
)
