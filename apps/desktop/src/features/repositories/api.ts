import { invoke } from "@tauri-apps/api/core";

export interface SaveRepositoryPayload {
  accountId: string;
  credentialId: string;
  name: string;
  localPath: string;
  remoteUrl: string;
  defaultBranch: string;
  authorFilterValue: string;
}

export async function saveRepository(payload: SaveRepositoryPayload) {
  return invoke<{ id: string }>("save_repository", { payload });
}
