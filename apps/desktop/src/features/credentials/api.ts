import { invoke } from "@tauri-apps/api/core";

export interface SaveCredentialPayload {
  accountId: string;
  displayName: string;
  credentialType: string;
  usernameHint: string;
  secretValue: string;
  sourcePath?: string;
}

export async function saveCredential(payload: SaveCredentialPayload) {
  return invoke<{ id: string }>("save_credential", { payload });
}
