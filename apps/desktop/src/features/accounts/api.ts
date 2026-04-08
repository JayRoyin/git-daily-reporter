import { invoke } from "@tauri-apps/api/core";

export interface SaveAccountPayload {
  displayName: string;
  gitUsername: string;
  gitEmail: string;
  defaultAuthType: string;
}

export interface AccountRecord {
  id: string;
  platform: string;
  displayName: string;
  gitUsername: string;
  gitEmail: string;
  defaultAuthType: string;
}

export async function saveAccount(payload: SaveAccountPayload) {
  return invoke<AccountRecord>("save_account", { payload });
}

export async function listAccounts() {
  return invoke<AccountRecord[]>("list_accounts");
}
