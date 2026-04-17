import { invokeOrDefault } from "../../lib/tauri";

export interface RepositoryRecord {
  id: string;
  name: string;
  localPath: string;
  remoteUrl: string;
  defaultBranch: string;
  authorFilterValue: string;
}

export async function listRepositories() {
  return invokeOrDefault<RepositoryRecord[]>("list_repositories", []);
}
