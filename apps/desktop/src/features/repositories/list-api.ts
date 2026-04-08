import { invoke } from "@tauri-apps/api/core";

export interface RepositoryRecord {
  id: string;
  name: string;
  localPath: string;
  remoteUrl: string;
  defaultBranch: string;
  authorFilterValue: string;
}

export async function listRepositories() {
  return invoke<RepositoryRecord[]>("list_repositories");
}
