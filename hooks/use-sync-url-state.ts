"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWorkspaceStore } from "@/lib/store"

export function useSyncUrlState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspaceId, loadWorkspace, hasHydrated } = useWorkspaceStore()
  const urlWorkspaceId = searchParams.get("workspaceId")

  // Lock mechanism to prevent sync loops
  const isUpdatingUrl = useRef(false)
  const hasInitiallySynced = useRef(false)

  // PARTICLE 1: Initial Sync (From URL to Store on first load)
  useEffect(() => {
    if (hasHydrated && !hasInitiallySynced.current) {
      if (urlWorkspaceId && urlWorkspaceId !== workspaceId) {
        loadWorkspace(urlWorkspaceId)
      }
      hasInitiallySynced.current = true
    }
  }, [hasHydrated, urlWorkspaceId, workspaceId, loadWorkspace])

  // PARTICLE 2: Store to URL (When workspace changes in app)
  useEffect(() => {
    const shouldUpdateUrl =
      hasHydrated &&
      hasInitiallySynced.current &&
      workspaceId !== urlWorkspaceId

    if (shouldUpdateUrl) {
      isUpdatingUrl.current = true
      const params = new URLSearchParams(searchParams.toString())

      if (workspaceId) params.set("workspaceId", workspaceId)
      else params.delete("workspaceId")

      router.replace(`/?${params.toString()}`, { scroll: false })

      // Release lock after a short timeout
      const timer = setTimeout(() => {
        isUpdatingUrl.current = false
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [workspaceId, router, searchParams, hasHydrated, urlWorkspaceId])

  // PARTICLE 3: URL to Store (When user clicks Back/Forward or edits URL manually)
  useEffect(() => {
    const shouldUpdateStore =
      hasHydrated &&
      hasInitiallySynced.current &&
      !isUpdatingUrl.current &&
      urlWorkspaceId !== workspaceId

    if (shouldUpdateStore) {
      loadWorkspace(urlWorkspaceId || "")
    }
  }, [urlWorkspaceId, workspaceId, loadWorkspace, hasHydrated])
}
