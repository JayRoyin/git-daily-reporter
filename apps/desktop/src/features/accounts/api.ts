import { invoke } from "@tauri-apps/api/core";

export interface SaveAccountPayload {
  platform: string;
  platformBaseUrl?: string;
  displayName: string;
  gitUsername: string;
  gitEmail: string;
  defaultAuthType: string;
}

export interface VerifyAccountPayload {
  platform: string;
  platformBaseUrl?: string;
  gitUsername: string;
  gitEmail: string;
  authType: string;
  token?: string;
}

export interface AccountRecord {
  id: string;
  platform: string;
  platformBaseUrl?: string;
  displayName: string;
  gitUsername: string;
  gitEmail: string;
  defaultAuthType: string;
  verificationStatus: string;
  verificationMessage?: string;
  lastVerifiedAt?: string;
}

export interface AccountVerificationResult {
  status: string;
  message: string;
}

export interface GitIdentitySuggestion {
  gitUsername: string;
  gitEmail: string;
}

export interface PlatformOption {
  id: string;
  label: string;
  baseUrl?: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: "github", label: "GitHub", baseUrl: "https://github.com" },
  { id: "gitlab", label: "GitLab", baseUrl: "https://gitlab.com" },
  { id: "gitea", label: "Gitea", baseUrl: "https://gitea.com" },
  { id: "gitee", label: "Gitee", baseUrl: "https://gitee.com" },
  { id: "custom", label: "Custom" },
];

export async function saveAccount(payload: SaveAccountPayload) {
  return invoke<AccountRecord>("save_account", { payload });
}

export async function listAccounts() {
  return invoke<AccountRecord[]>("list_accounts");
}

export async function verifyAccount(payload: VerifyAccountPayload) {
  return invoke<AccountVerificationResult>("verify_account", { payload });
}

export async function readGitIdentity() {
  const result = await invoke<AccountVerificationResult>("read_git_identity");
  return JSON.parse(result.message) as GitIdentitySuggestion;
}
