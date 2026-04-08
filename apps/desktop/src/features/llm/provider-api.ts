import { invoke } from "@tauri-apps/api/core";

export interface SaveProviderPayload {
  providerName: string;
  baseUrl: string;
  model: string;
  apiKeyRef: string;
}

export interface LLMProviderRecord {
  id: string;
  providerName: string;
  baseUrl: string;
  model: string;
  apiKeyRef: string;
}

export async function saveProvider(payload: SaveProviderPayload) {
  return invoke<{ id: string }>("save_llm_provider", { payload });
}

export async function listProviders() {
  return invoke<LLMProviderRecord[]>("list_llm_providers");
}

export async function setActiveProvider(providerId: string) {
  return invoke("set_active_llm_provider", { providerId });
}

export async function deleteProvider(providerId: string) {
  return invoke("delete_llm_provider", { providerId });
}
