import { useEffect, useState } from "react";

import type { Language } from "../i18n/i18n";
import { saveSecret } from "../security/secure-store";
import { useVault } from "../security/VaultContext";
import { testProviderConnection } from "./llm-client";
import {
  deleteProvider,
  listProviders,
  saveProvider,
  setActiveProvider,
} from "./provider-api";
import { PROVIDER_PRESETS } from "./provider-presets";
import { ProviderList } from "./ProviderList";

interface LLMSettingsFormProps {
  language: Language;
}

export function LLMSettingsForm({ language }: LLMSettingsFormProps) {
  const { isUnlocked, masterPassword } = useVault();
  const [providerName, setProviderName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [activeProviderId, setActiveProviderId] = useState("");

  async function refreshProviders() {
    const items = await listProviders();
    const safeItems = Array.isArray(items) ? items : [];
    setProviders(safeItems);
    if (!activeProviderId && safeItems.length) {
      setActiveProviderId(safeItems[0].id);
    }
  }

  async function handleSave() {
    if (!isUnlocked) {
      setError(language === "zh" ? "请先解锁保险库" : "Unlock the vault first");
      return;
    }

    const apiKeyRef = await saveSecret(
      masterPassword,
      `llm:${providerName}:${model}`,
      apiKey,
    );

    await saveProvider({
      providerName,
      baseUrl,
      model,
      apiKeyRef,
    });
    await refreshProviders();

    setError("");
    setSaved(true);
  }

  async function handleTestConnection() {
    if (!isUnlocked) {
      setError(language === "zh" ? "请先解锁保险库" : "Unlock the vault first");
      return;
    }

    try {
      await testProviderConnection({
        baseUrl,
        model,
        apiKey,
      });
      setConnectionStatus(
        language === "zh" ? "连接测试成功" : "Connection successful",
      );
      setError("");
    } catch (err) {
      setConnectionStatus("");
      setError(err instanceof Error ? err.message : "Unknown connection error");
    }
  }

  async function handleActivate(providerId: string) {
    await setActiveProvider(providerId);
    setActiveProviderId(providerId);
  }

  async function handleDelete(providerId: string) {
    await deleteProvider(providerId);
    const remaining = providers.filter((item) => item.id !== providerId);
    setProviders(remaining);
    if (activeProviderId === providerId) {
      setActiveProviderId(remaining[0]?.id ?? "");
    }
  }

  useEffect(() => {
    void refreshProviders();
  }, []);

  return (
    <section className="form-card">
      <h3>{language === "zh" ? "LLM 提供方设置" : "LLM Provider Settings"}</h3>
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
          <input value={model} onChange={(event) => setModel(event.target.value)} />
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
