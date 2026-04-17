import { invokeOrThrow } from "../../lib/tauri";

export interface SaveCredentialPayload {
  accountId: string;
  displayName: string;
  credentialType: string;
  usernameHint: string;
  secretValue: string;
  sourcePath?: string;
}

export async function saveCredential(payload: SaveCredentialPayload) {
  return invokeOrThrow<{ id: string }>("save_credential", { payload });
}
