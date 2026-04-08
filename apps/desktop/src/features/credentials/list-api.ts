import { invoke } from "@tauri-apps/api/core";

export interface CredentialRecord {
  id: string;
  accountId: string;
  type: string;
  displayName: string;
  usernameHint: string;
}

export async function listCredentials() {
  return invoke<CredentialRecord[]>("list_credentials");
}
