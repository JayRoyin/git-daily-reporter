import { invoke } from "@tauri-apps/api/core";

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
  return invoke<CredentialRecord[]>("list_credentials");
}

export async function discoverSshKeys() {
  return invoke<DiscoveredSSHKey[]>("discover_ssh_keys");
}

export async function revealSecret(secretRef: string) {
  return invoke<RevealSecretResult>("reveal_secret", { payload: { secretRef } });
}
