import type { CredentialRecord } from "../credentials/list-api";
import { CredentialForm } from "../forms/CredentialForm";
import type { Language } from "../i18n/i18n";
import { LLMSettingsForm } from "../llm/LLMSettingsForm";
import { revealSecret } from "../credentials/list-api";
import { useState } from "react";

interface CredentialsPageProps {
  language: Language;
  credentials: CredentialRecord[];
  accountOptions: Array<{ id: string; label: string }>;
}

export function CredentialsPage({
  language,
  credentials,
  accountOptions,
}: CredentialsPageProps) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  async function handleToggle(item: CredentialRecord) {
    if (revealed[item.id]) {
      setRevealed((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      return;
    }

    const result = await revealSecret(item.secretRef);
    setRevealed((current) => ({ ...current, [item.id]: result.value }));
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="page-kicker">{language === "zh" ? "密钥与令牌" : "Secrets and tokens"}</p>
        <h1 className="page-title">{language === "zh" ? "凭证管理" : "Credentials"}</h1>
        <p className="page-subtitle">
          {language === "zh"
            ? "集中管理 SSH 私钥、访问令牌和 LLM API Key，默认只显示掩码，按需点击查看完整值。"
            : "Manage SSH keys, access tokens, and LLM API keys with masked display and on-demand reveal."}
        </p>
      </header>

      <CredentialForm language={language} accountOptions={accountOptions} />
      <LLMSettingsForm language={language} />

      <section className="workspace-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{language === "zh" ? "当前凭证" : "Current credentials"}</p>
            <h2>{language === "zh" ? "凭证摘要" : "Credential summary"}</h2>
          </div>
        </div>

        {credentials.length ? (
          <div className="list-table">
            <div className="list-row list-row--header">
              <span>{language === "zh" ? "名称" : "Name"}</span>
              <span>{language === "zh" ? "类型" : "Type"}</span>
              <span>{language === "zh" ? "掩码 / 明文" : "Masked / revealed"}</span>
              <span>{language === "zh" ? "操作" : "Action"}</span>
            </div>
            {credentials.map((item) => (
              <div className="list-row" key={item.id}>
                <span>{item.displayName}</span>
                <span>{item.type}</span>
                <span>{revealed[item.id] ?? item.secretMask}</span>
                <span>
                  <button
                    className="form-action secondary compact"
                    type="button"
                    onClick={() => handleToggle(item)}
                  >
                    {revealed[item.id]
                      ? language === "zh"
                        ? "隐藏"
                        : "Hide"
                      : language === "zh"
                        ? "显示"
                        : "Reveal"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>{language === "zh" ? "暂无凭证" : "No credentials yet"}</h3>
            <p>
              {language === "zh"
                ? "你可以手动录入访问令牌，也可以先自动扫描本机 SSH 密钥。"
                : "Add access tokens manually or discover SSH keys from the local machine first."}
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
