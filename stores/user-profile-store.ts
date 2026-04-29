import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { UserProfileState } from "@/types/user-profile-state-type"

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      apiKey: "",
      encodedApiKey: "",
      userProfile: null,
      hasHydrated: false,

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
    }),
    {
      name: "user-profile-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        encodedApiKey: state.encodedApiKey,
        userProfile: state.userProfile,
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
        state?.setHasHydrated(true)
      },
    }
  )
)
