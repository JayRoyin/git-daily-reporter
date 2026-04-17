import { invokeOrDefault, invokeOrThrow } from "../../lib/tauri";

export interface SaveProviderPayload {
  providerName: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface TestProviderPayload {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface ProviderTestResult {
  status: string;
  message: string;
}

export interface ProviderModelsResult {
  models: string[];
}

export interface LLMProviderRecord {
  id: string;
  providerName: string;
  baseUrl: string;
  model: string;
  apiKeyRef: string;
  apiKeyMask: string;
  lastTestedAt?: string;
  testStatus: string;
  isActive: boolean;
}

export async function saveProvider(payload: SaveProviderPayload) {
  return invokeOrThrow<{ id: string }>("save_llm_provider", { payload });
}

export async function listProviders() {
  return invokeOrDefault<LLMProviderRecord[]>("list_llm_providers", []);
}

export async function setActiveProvider(providerId: string) {
  return invokeOrThrow("set_active_llm_provider", { providerId });
}

export async function deleteProvider(providerId: string) {
  return invokeOrThrow("delete_llm_provider", { providerId });
}

export async function testProviderConnection(payload: TestProviderPayload) {
  return invokeOrThrow<ProviderTestResult>("test_llm_provider", { payload });
}

export async function fetchProviderModels(payload: TestProviderPayload) {
  return invokeOrThrow<ProviderModelsResult>("fetch_llm_models", { payload });
}
