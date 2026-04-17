import { invokeOrThrow } from "../../lib/tauri";

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
  return invokeOrThrow<{ id: string }>("save_repository", { payload });
}
