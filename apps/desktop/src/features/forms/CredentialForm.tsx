import { useState } from "react";

import { saveCredential } from "../credentials/api";
import { discoverSshKeys, type DiscoveredSSHKey } from "../credentials/list-api";
import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";

interface CredentialFormProps {
  language: Language;
  accountOptions: Array<{ id: string; label: string }>;
  onSaved?: () => Promise<void> | void;
}

export function CredentialForm({ language, accountOptions, onSaved }: CredentialFormProps) {
  const copy = messages[language];
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [credentialType, setCredentialType] = useState("ssh");
  const [usernameHint, setUsernameHint] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [discoveredKeys, setDiscoveredKeys] = useState<DiscoveredSSHKey[]>([]);

  async function handleSave() {
    try {
      await saveCredential({
        accountId,
        displayName,
        credentialType,
        usernameHint,
        secretValue,
        sourcePath: sourcePath || undefined,
      });
      await onSaved?.();
      setError("");
      setSaved(true);
    } catch (err) {
      setSaved(false);
      setError(err instanceof Error ? err.message : "Unknown credential save error");
    }
  }

  async function handleDiscoverSshKeys() {
    try {
      const keys = await discoverSshKeys();
      setDiscoveredKeys(Array.isArray(keys) ? keys : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown SSH discovery error");
    }
  }

  function applyDiscoveredKey(item: DiscoveredSSHKey) {
    setCredentialType("ssh");
    setDisplayName(item.displayName);
    setSourcePath(item.sourcePath);
    setUsernameHint(item.usernameHint);
    setSecretValue(item.secretValue);
  }

  return (
    <section className="form-card">
      <h3>{copy.credentialWorkspace}</h3>
      <p>
        {language === "zh"
          ? "集中管理 SSH 私钥和访问令牌，默认只展示掩码信息。"
          : "Manage SSH private keys and access tokens with masked display by default."}
      </p>

      <div className="form-grid">
        <label className="form-field">
          <span>{language === "zh" ? "所属账户" : "Account"}</span>
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            <option value="">{language === "zh" ? "请选择账户" : "Select account"}</option>
            {accountOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>{copy.defaultAuth}</span>
          <select
            value={credentialType}
            onChange={(event) => setCredentialType(event.target.value)}
          >
            <option value="ssh">{copy.sshKey}</option>
            <option value="https_token">{copy.githubToken}</option>
          </select>
        </label>

        <label className="form-field">
          <span>{copy.displayName}</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Work credential"
          />
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "用户名提示" : "Username hint"}</span>
          <input
            value={usernameHint}
            onChange={(event) => setUsernameHint(event.target.value)}
            placeholder="qstdc"
          />
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "来源路径" : "Source path"}</span>
          <input
            value={sourcePath}
            onChange={(event) => setSourcePath(event.target.value)}
            placeholder="~/.ssh/id_ed25519"
          />
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "密钥或令牌内容" : "Secret value"}</span>
          <input
            type="password"
            value={secretValue}
            onChange={(event) => setSecretValue(event.target.value)}
            placeholder="secret"
          />
        </label>
      </div>

      <div className="button-row">
        <button className="form-action secondary" type="button" onClick={handleDiscoverSshKeys}>
          {language === "zh" ? "自动扫描 SSH 密钥" : "Discover SSH keys"}
        </button>
        <button className="form-action" type="button" onClick={handleSave}>
          {language === "zh" ? "保存凭证" : "Save credential"}
        </button>
      </div>

      {discoveredKeys.length ? (
        <section className="summary-list">
          <h3>{language === "zh" ? "已发现 SSH 密钥" : "Discovered SSH keys"}</h3>
          {discoveredKeys.map((item) => (
            <div key={item.sourcePath} className="provider-row">
              <div>
                <p>{item.displayName}</p>
                <p>{item.sourcePath}</p>
                <p>{item.secretMask}</p>
              </div>
              <div className="provider-actions">
                <button
                  className="form-action secondary compact"
                  type="button"
                  onClick={() => applyDiscoveredKey(item)}
                >
                  {language === "zh" ? "导入到表单" : "Use this key"}
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}
      {saved ? <p className="save-banner">{language === "zh" ? "凭证已保存" : "Credential saved"}</p> : null}
    </section>
  );
}
