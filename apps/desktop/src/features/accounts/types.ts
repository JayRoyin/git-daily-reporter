export type AccountPlatform = "github" | "gitlab" | "gitea" | "custom";
export type AuthTransport = "ssh" | "https_token";

export interface Account {
  id: string;
  platform: AccountPlatform;
  displayName: string;
  gitUsername: string;
  gitEmail: string;
  defaultAuthType: AuthTransport;
}
