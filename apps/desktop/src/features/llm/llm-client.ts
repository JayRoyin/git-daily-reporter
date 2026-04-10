import { invoke } from "@tauri-apps/api/core";

import { testProviderConnection as testProviderConnectionCommand } from "./provider-api";

export async function summarizeReport(reportContent: string) {
  return invoke<string>("generate_llm_summary", { reportContent });
}

export async function testProviderConnection(input: {
  baseUrl: string;
  model: string;
  apiKey: string;
}) {
  return testProviderConnectionCommand(input);
}
