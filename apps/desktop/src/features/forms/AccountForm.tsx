import { useState } from "react";

import { PLATFORM_OPTIONS, readGitIdentity, verifyAccount } from "../accounts/api";
import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";

interface AccountFormProps {
  language: Language;
  onSave?: (payload: {
    platform: string;
    platformBaseUrl?: string;
    displayName: string;
    gitUsername: string;
    gitEmail: string;
    defaultAuthType: string;
  }) => Promise<void> | void;
}

export function AccountForm({ language, onSave }: AccountFormProps) {
  const copy = messages[language];
  const [platform, setPlatform] = useState("github");
  const [customPlatformBaseUrl, setCustomPlatformBaseUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gitUsername, setGitUsername] = useState("");
  const [gitEmail, setGitEmail] = useState("");
  const [defaultAuthType, setDefaultAuthType] = useState("ssh");
  const [token, setToken] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const selectedPlatform = PLATFORM_OPTIONS.find((item) => item.id === platform);
  const platformBaseUrl = selectedPlatform?.baseUrl ?? "";
  const resolvedPlatformBaseUrl =
    selectedPlatform?.id === "custom" ? customPlatformBaseUrl || undefined : platformBaseUrl || undefined;

  async function handleReadGitIdentity() {
    try {
      const result = await readGitIdentity();
      setGitUsername(result.gitUsername);
      setGitEmail(result.gitEmail);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown git config error");
    }
  }

  async function handleVerify() {
    try {
      const result = await verifyAccount({
        platform,
        platformBaseUrl: resolvedPlatformBaseUrl,
        gitUsername,
        gitEmail,
        authType: defaultAuthType,
        token: defaultAuthType === "https_token" ? token : undefined,
      });
      setVerificationMessage(result.message);
      setError("");
      setSavedMessage("");
    } catch (err) {
      setVerificationMessage("");
      setError(err instanceof Error ? err.message : "Unknown verification error");
    }
  }

  return (
    <section className="form-card">
      <h3>{copy.accountWorkspace}</h3>
      <p>{copy.accountSummary}</p>

      <div className="form-grid">
        <label className="form-field">
          <span>{language === "zh" ? "平台" : "Platform"}</span>
          <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {PLATFORM_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {selectedPlatform?.id === "custom" ? (
          <label className="form-field">
            <span>{language === "zh" ? "平台地址" : "Platform base URL"}</span>
            <input
              value={customPlatformBaseUrl}
              onChange={(event) => setCustomPlatformBaseUrl(event.target.value)}
              placeholder="https://git.example.com"
            />
          </label>
        ) : null}

        <label className="form-field">
          <span>{copy.displayName}</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={copy.accountPlaceholder}
          />
        </label>

        <label className="form-field">
          <span>{copy.gitUsername}</span>
          <input
            value={gitUsername}
            onChange={(event) => setGitUsername(event.target.value)}
            placeholder="qstdc"
          />
        </label>

        <label className="form-field">
          <span>{copy.gitEmail}</span>
          <input
            value={gitEmail}
            onChange={(event) => setGitEmail(event.target.value)}
            placeholder="qstdc@example.com"
          />
        </label>

        <label className="form-field">
          <span>{copy.defaultAuth}</span>
          <select
            value={defaultAuthType}
            onChange={(event) => setDefaultAuthType(event.target.value)}
          >
            <option value="ssh">SSH</option>
            <option value="https_token">HTTPS + Token</option>
          </select>
        </label>

        {defaultAuthType === "https_token" ? (
          <label className="form-field">
            <span>{language === "zh" ? "验证 Token" : "Verification token"}</span>
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="ghp_xxx"
            />
          </label>
        ) : null}
      </div>

      <div className="button-row">
        <button className="form-action secondary" type="button" onClick={handleReadGitIdentity}>
          {language === "zh" ? "自动读取 Git 配置" : "Read Git config"}
        </button>
        <button className="form-action secondary" type="button" onClick={handleVerify}>
          {language === "zh" ? "验证登录" : "Verify login"}
        </button>
        <button
          className="form-action"
          type="button"
          onClick={async () => {
            try {
              await onSave?.({
                platform,
                platformBaseUrl: resolvedPlatformBaseUrl,
                displayName,
                gitUsername,
                gitEmail,
                defaultAuthType,
              });
              setSavedMessage(language === "zh" ? "账户已保存" : "Account saved");
              setError("");
              setVerificationMessage("");
            } catch (err) {
              setSavedMessage("");
              setError(err instanceof Error ? err.message : "Unknown save error");
            }
          }}
        >
          {language === "zh" ? "保存账户" : "Save account"}
        </button>
      </div>

      {savedMessage ? <p className="save-banner">{savedMessage}</p> : null}
      {verificationMessage ? <p className="save-banner">{verificationMessage}</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}
