import { invokeOrDefault, invokeOrThrow } from "../../lib/tauri";

export interface CredentialRecord {
  id: string;
  accountId: string;
  type: string;
  displayName: string;
  usernameHint: string;
  secretRef: string;
  secretMask: string;
  sourcePath?: string;
  verificationStatus: string;
}

export interface DiscoveredSSHKey {
  displayName: string;
  sourcePath: string;
  usernameHint: string;
  secretMask: string;
  secretValue: string;
}

export interface RevealSecretResult {
  value: string;
}

export async function listCredentials() {
  return invokeOrDefault<CredentialRecord[]>("list_credentials", []);
}

export async function discoverSshKeys() {
  return invokeOrDefault<DiscoveredSSHKey[]>("discover_ssh_keys", []);
}

export async function revealSecret(secretRef: string) {
  return invokeOrThrow<RevealSecretResult>("reveal_secret", { payload: { secretRef } });
}
