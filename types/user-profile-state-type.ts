import { PostmanUser } from "./postman-user-type"

export interface UserProfileState {
  apiKey: string
  encodedApiKey: string
  userProfile: PostmanUser | null
  hasHydrated: boolean

  setApiKey: (key: string) => void
  login: (key: string, profile: PostmanUser) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}
