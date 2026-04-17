import { testProviderConnection as testProviderConnectionCommand } from "./provider-api";
import { invokeOrThrow } from "../../lib/tauri";

export async function summarizeReport(reportContent: string) {
  return invokeOrThrow<string>("generate_llm_summary", { reportContent });
}

export async function testProviderConnection(input: {
  baseUrl: string;
  model: string;
  apiKey: string;
}) {
  return testProviderConnectionCommand(input);
}
