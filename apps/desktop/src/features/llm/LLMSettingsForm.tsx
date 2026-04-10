import { useEffect, useState } from "react";

import type { Language } from "../i18n/i18n";
import { testProviderConnection } from "./llm-client";
import {
  deleteProvider,
  fetchProviderModels,
  listProviders,
  saveProvider,
  setActiveProvider,
  type LLMProviderRecord,
} from "./provider-api";
import { PROVIDER_PRESETS, modelsForProvider } from "./provider-presets";
import { ProviderList } from "./ProviderList";

interface LLMSettingsFormProps {
  language: Language;
}

export function LLMSettingsForm({ language }: LLMSettingsFormProps) {
  const [providerName, setProviderName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [providers, setProviders] = useState<LLMProviderRecord[]>([]);
  const [activeProviderId, setActiveProviderId] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  async function refreshProviders() {
    const items = await listProviders();
    const safeItems = Array.isArray(items) ? items : [];
    setProviders(safeItems);
    const active = safeItems.find((item) => item.isActive);
    setActiveProviderId(active?.id ?? safeItems[0]?.id ?? "");
  }

  async function handleSave() {
    try {
      await saveProvider({
        providerName,
        baseUrl,
        model,
        apiKey,
      });
      await refreshProviders();
      setError("");
      setSaved(true);
    } catch (err) {
      setSaved(false);
      setError(err instanceof Error ? err.message : "Unknown provider save error");
    }
  }

  async function handleTestConnection() {
    try {
      const result = await testProviderConnection({
        baseUrl,
        model,
        apiKey,
      });
      setConnectionStatus(result.message);
      setError("");
    } catch (err) {
      setConnectionStatus("");
      setError(err instanceof Error ? err.message : "Unknown connection error");
    }
  }

  async function handleActivate(providerId: string) {
    await setActiveProvider(providerId);
    await refreshProviders();
  }

  async function handleDelete(providerId: string) {
    await deleteProvider(providerId);
    await refreshProviders();
  }

  useEffect(() => {
    void refreshProviders();
  }, []);

  return (
    <section className="form-card">
      <h3>{language === "zh" ? "LLM 提供方设置" : "LLM Provider Settings"}</h3>
      <p>
        {language === "zh"
          ? "测试连接和 AI 总结请求都通过桌面端后端代理执行，不再依赖 WebView 内部网络栈。"
          : "LLM connection tests and summary requests are executed through backend commands instead of the WebView network stack."}
      </p>
      <div className="form-grid">
        <label className="form-field">
          <span>{language === "zh" ? "预设提供方" : "Preset provider"}</span>
          <select
            defaultValue=""
            onChange={(event) => {
              const preset = PROVIDER_PRESETS.find((item) => item.id === event.target.value);
              if (!preset) return;
              setProviderName(preset.label);
              setBaseUrl(preset.baseUrl);
              setModel(preset.modelHint);
              setAvailableModels(preset.models);
            }}
          >
            <option value="">{language === "zh" ? "请选择预设" : "Select preset"}</option>
            {PROVIDER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "提供方名称" : "Provider name"}</span>
          <input value={providerName} onChange={(event) => setProviderName(event.target.value)} />
        </label>
        <label className="form-field">
          <span>{language === "zh" ? "Base URL" : "Base URL"}</span>
          <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
        </label>
        <label className="form-field">
          <span>{language === "zh" ? "模型" : "Model"}</span>
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            <option value="">{language === "zh" ? "请选择模型" : "Select model"}</option>
            {(availableModels.length ? availableModels : modelsForProvider(providerName)).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>{language === "zh" ? "API 密钥" : "API key"}</span>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
        </label>
      </div>
      <div className="button-row">
        <button
          className="form-action secondary"
          type="button"
          onClick={async () => {
            try {
              const result = await fetchProviderModels({ baseUrl, model, apiKey });
              setAvailableModels(result.models);
              setConnectionStatus(
                language === "zh" ? "已更新模型列表" : "Model list refreshed",
              );
              setError("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unknown model list error");
            }
          }}
        >
          {language === "zh" ? "获取模型列表" : "Fetch models"}
        </button>
        <button className="form-action secondary" type="button" onClick={handleTestConnection}>
          {language === "zh" ? "测试连接" : "Test connection"}
        </button>
        <button className="form-action" type="button" onClick={handleSave}>
          {language === "zh" ? "保存提供方" : "Save provider"}
        </button>
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
      {connectionStatus ? <p className="save-banner">{connectionStatus}</p> : null}
      {saved ? <p className="save-banner">{language === "zh" ? "提供方已保存" : "Provider saved"}</p> : null}
      <ProviderList
        language={language}
        providers={providers}
        activeProviderId={activeProviderId}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </section>
  );
}
