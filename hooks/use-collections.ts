"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchCollections, fetchCollectionDetail } from "@/lib/api"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useUserProfileStore } from "@/stores/user-profile-store"
import { downloadJson, downloadZip, getFormattedTimestamp } from "@/lib/utils"
import { toast } from "sonner"
import { Collection } from "@/components/collection-table"

export function useCollections() {
  const { apiKey } = useUserProfileStore()
  const {
    workspaceId,
    savedWorkspaces,
    setDownloadingId,
    setIsBulkDownloading,
  } = useWorkspaceStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ["collections", workspaceId, apiKey],
    queryFn: async () => {
      const allCollections = await fetchCollections(workspaceId, apiKey)

      const filtered = allCollections.filter((c: any) => {
        const isGrpc =
          c.name?.toLowerCase().includes("grpc") || c.protocol === "grpc"
        return !isGrpc
      })

      return {
        list: filtered,
        skippedCount: allCollections.length - filtered.length,
      }
    },
    enabled: !!workspaceId && !!apiKey,
  })

  const collections = data?.list || []

  const workspaceName =
    savedWorkspaces.find((w) => w.id === workspaceId)?.label || "workspace"

  const handleDownload = async (collection: Collection) => {
    if (!apiKey) return
    setDownloadingId(collection.uid)
    try {
      const detail = await fetchCollectionDetail(collection.uid, apiKey)

      // Guard: user might have logged out while fetch was in-flight
      if (!useUserProfileStore.getState().apiKey) {
        setDownloadingId(null)
        return
      }

      downloadJson(detail, `${collection.name}.json`)
      toast.success(`Downloaded ${collection.name}`)
    } catch (err: any) {
      toast.error(`Failed to download: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleBulkDownload = async (items: Collection[]) => {
    if (!apiKey || items.length === 0) return

    const isSingle = items.length === 1
    setIsBulkDownloading(true)
    const toastId = toast.loading(`Preparing ${items.length} collection(s)...`)

    try {
      if (isSingle) {
        const detail = await fetchCollectionDetail(items[0].uid, apiKey)

        // Guard: user logged out mid-flight
        if (!useUserProfileStore.getState().apiKey) {
          toast.dismiss(toastId)
          return
        }

        downloadJson(detail, `${items[0].name}.json`)
      } else {
        const files = await Promise.all(
          items.map(async (item) => ({
            name: item.name,
            content: await fetchCollectionDetail(item.uid, apiKey),
          }))
        )

        // Guard: user logged out mid-flight
        if (!useUserProfileStore.getState().apiKey) {
          toast.dismiss(toastId)
          return
        }

        const fileName = `${workspaceName}_${getFormattedTimestamp()}`
        await downloadZip(files, fileName)
      }
      toast.success(
        isSingle
          ? "Downloaded successfully"
          : `ZIP created with ${items.length} collections`,
        { id: toastId }
      )
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId })
    } finally {
      setIsBulkDownloading(false)
    }
  }

  return {
    collections,
    workspaceName,
    isLoading,
    error,
    handleDownload,
    handleBulkDownload,
  }
}
