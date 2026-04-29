"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWorkspaceStore } from "@/lib/store"

export function useSyncUrlState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspaceId, loadWorkspace, hasHydrated } = useWorkspaceStore()
  const urlWorkspaceId = searchParams.get("workspaceId")

  const hasInitiallySynced = useRef(false)
  const lastAppliedUrlWorkspaceId = useRef<string | null>(null)

  // Source of truth: URL workspaceId when present. This also covers back/forward edits.
  useEffect(() => {
    if (!hasHydrated) return

    const normalizedUrlId = urlWorkspaceId || ""

    if (!hasInitiallySynced.current) {
      hasInitiallySynced.current = true
      lastAppliedUrlWorkspaceId.current = normalizedUrlId

      if (normalizedUrlId && normalizedUrlId !== workspaceId) {
        loadWorkspace(normalizedUrlId)
      }
      return
    }

    if (lastAppliedUrlWorkspaceId.current === normalizedUrlId) return
    lastAppliedUrlWorkspaceId.current = normalizedUrlId

    if (normalizedUrlId !== workspaceId) {
      loadWorkspace(normalizedUrlId)
    }
  }, [hasHydrated, urlWorkspaceId, workspaceId, loadWorkspace])

  // Keep URL in sync for app-driven workspace changes.
  useEffect(() => {
    if (!hasHydrated || !hasInitiallySynced.current) return
    if (workspaceId === (urlWorkspaceId || "")) return

    const params = new URLSearchParams(searchParams.toString())

    if (workspaceId) params.set("workspaceId", workspaceId)
    else params.delete("workspaceId")

    const query = params.toString()
    router.replace(query ? `/?${query}` : "/", { scroll: false })
  }, [workspaceId, urlWorkspaceId, searchParams, router, hasHydrated])
}
