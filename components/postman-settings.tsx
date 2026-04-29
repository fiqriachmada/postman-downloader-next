"use client"

import { Key, Eye, EyeOff, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useUserProfileStore } from "@/stores/user-profile-store"
import { fetchCurrentUser } from "@/lib/api"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PostmanSettings() {
  const {
    apiKey,
    encodedApiKey,
    userProfile,
    logout,
    login,
  } = useUserProfileStore()

  const {
    settingsShowKey: showKey,
    settingsDraftApiKey: draftApiKey,
    settingsIsValidating: isValidating,
    setSettingsShowKey: setShowKey,
    setSettingsDraftApiKey: setDraftApiKey,
    setSettingsIsValidating: setIsValidating,
  } = useWorkspaceStore()

  const handleValidate = async () => {
    const cleanedKey = draftApiKey.trim()

    if (!cleanedKey) {
      toast.error("Please enter your Postman API Key first")
      return
    }

    try {
      setIsValidating(true)
      const user = await fetchCurrentUser(cleanedKey)

      const displayName =
        user?.fullName || user?.name || user?.username || "Unknown User"

      login(cleanedKey, { ...user })

      toast.success(`API key valid. Logged in as ${displayName}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to validate API key"
      toast.error(message)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          {userProfile ? (
            <Avatar className="h-8 w-8 shrink-0 border bg-muted">
              <AvatarImage
                src={
                  userProfile?.avatar || "https://www.postman.com/favicon.ico"
                }
                alt={userProfile?.name}
              />
              <AvatarFallback className="font-medium text-muted-foreground">
                {userProfile?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <Key className="h-4 w-4" />
              Setup API Key
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-4 p-4" align="end">
          {userProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0 border bg-muted">
                  <AvatarImage
                    src={
                      userProfile.avatar ||
                      "https://www.postman.com/favicon.ico"
                    }
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="font-medium text-muted-foreground">
                    {userProfile.fullName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="truncate text-sm font-medium">
                    {userProfile.fullName}
                  </h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {userProfile.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  toast.success("Logout successfully")
                }}
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <h4 className="leading-none font-medium">Postman API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Required to fetch collections from your workspace.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="PMAK-..."
                    value={draftApiKey}
                    onChange={(e) => setDraftApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleValidate}
                  disabled={isValidating}
                >
                  {isValidating ? "Validating..." : "Validate"}
                </Button>
              </div>
              <p className="text-left text-[10px] text-muted-foreground">
                Get your key from{" "}
                <a
                  href="https://web.postman.co/settings/me/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  Postman Settings
                </a>
                .
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
