import type { Language } from "../i18n/i18n";
import type { LLMProviderRecord } from "./provider-api";

interface ProviderListProps {
  language: Language;
  providers: LLMProviderRecord[];
  activeProviderId: string;
  onActivate: (providerId: string) => void;
  onDelete: (providerId: string) => void;
}

export function ProviderList({
  language,
  providers,
  activeProviderId,
  onActivate,
  onDelete,
}: ProviderListProps) {
  if (!providers.length) {
    return null;
  }

  return (
    <section className="summary-list">
      <h3>{language === "zh" ? "已保存 LLM 提供方" : "Saved LLM providers"}</h3>
      {providers.map((provider) => (
        <div key={provider.id} className="provider-row">
          <div>
            <p>{provider.providerName}</p>
            <p>{provider.model}</p>
          </div>
          <div className="provider-actions">
            {activeProviderId === provider.id ? (
              <span className="chip chip--ok">
                {language === "zh" ? "当前激活" : "Active"}
              </span>
            ) : (
              <button
                className="form-action secondary compact"
                type="button"
                onClick={() => onActivate(provider.id)}
              >
                {language === "zh" ? `使用 ${provider.providerName}` : `Use ${provider.providerName}`}
              </button>
            )}
            <button
              className="form-action secondary compact danger"
              type="button"
              onClick={() => onDelete(provider.id)}
            >
              {language === "zh" ? `删除 ${provider.providerName}` : `Delete ${provider.providerName}`}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
