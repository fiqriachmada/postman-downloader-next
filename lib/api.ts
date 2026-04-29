import { PostmanUser } from "@/types/postman-user-type"

const POSTMAN_API_BASE = "https://api.getpostman.com"

export async function fetchCollections(workspaceId: string, apiKey: string) {
  if (!workspaceId || !apiKey) return []

  const response = await fetch(
    `${POSTMAN_API_BASE}/collections?workspace=${workspaceId}`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || "Failed to fetch collections")
  }

  const data = await response.json()
  return data.collections || []
}

export async function fetchCollectionDetail(
  collectionUid: string,
  apiKey: string
) {
  if (!collectionUid || !apiKey) return null

  const response = await fetch(
    `${POSTMAN_API_BASE}/collections/${collectionUid}`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.error?.message || "Failed to fetch collection detail"
    )
  }

  const data = await response.json()
  return data.collection
}

export async function fetchWorkspace(workspaceId: string, apiKey: string) {
  if (!workspaceId || !apiKey) return null

  const response = await fetch(
    `${POSTMAN_API_BASE}/workspaces/${workspaceId}`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.error?.message || "Failed to fetch workspace info"
    )
  }

  const data = await response.json()
  return data.workspace
}

export async function fetchCurrentUser(
  apiKey: string
): Promise<Partial<PostmanUser> | null> {
  if (!apiKey) return null

  const response = await fetch(`${POSTMAN_API_BASE}/me`, {
    headers: {
      "X-Api-Key": apiKey,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || "Failed to validate API key")
  }

  const data = await response.json()
  console.log("data", data)
  return data.user || null
}
