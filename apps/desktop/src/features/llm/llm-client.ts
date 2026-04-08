import { loadSecret } from "../security/secure-store";
import { listProviders } from "./provider-api";

function normalizeChatCompletionsUrl(baseUrl: string) {
  if (baseUrl.endsWith("/chat/completions")) {
    return baseUrl;
  }
  if (baseUrl.endsWith("/v1") || baseUrl.endsWith("/v2") || baseUrl.endsWith("/v3")) {
    return `${baseUrl}/chat/completions`;
  }
  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}

async function postChatCompletion(baseUrl: string, apiKey: string, model: string, userContent: string) {
  const response = await fetch(normalizeChatCompletionsUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a precise assistant. Return concise and valid responses only.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "No summary returned";
}

export async function summarizeReport(reportContent: string, masterPassword?: string) {
  const providers = await listProviders();
  if (!providers.length) {
    throw new Error("No LLM provider configured");
  }
  if (!masterPassword) {
    throw new Error("Vault password is required for LLM calls");
  }

  const provider = providers[0];
  const apiKey = await loadSecret(masterPassword, provider.apiKeyRef.replace("stronghold://", ""));
  return postChatCompletion(
    provider.baseUrl,
    apiKey,
    provider.model,
    reportContent,
  );
}

export async function testProviderConnection(input: {
  baseUrl: string;
  model: string;
  apiKey: string;
}) {
  await postChatCompletion(
    input.baseUrl,
    input.apiKey,
    input.model,
    "Reply with OK if the model is reachable.",
  );
  return "ok";
}
