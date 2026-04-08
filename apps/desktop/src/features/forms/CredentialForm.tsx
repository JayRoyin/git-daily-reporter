import { useState } from "react";

import { saveCredential } from "../credentials/api";
import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";
import { saveSecret } from "../security/secure-store";
import { useVault } from "../security/VaultContext";

interface CredentialFormProps {
  language: Language;
  accountOptions: Array<{ id: string; label: string }>;
}

export function CredentialForm({ language, accountOptions }: CredentialFormProps) {
  const copy = messages[language];
  const { isUnlocked, masterPassword } = useVault();
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [credentialType, setCredentialType] = useState("ssh");
  const [usernameHint, setUsernameHint] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!isUnlocked) {
      setError(language === "zh" ? "请先解锁保险库" : "Unlock the vault first");
      return;
    }

    const secretKey = `credential:${displayName || credentialType}`;
    const secretRef = await saveSecret(masterPassword, secretKey, secretValue);
    await saveCredential({
      accountId,
      displayName,
      credentialType,
      usernameHint,
      secretRef,
    });
    setError("");
    setSaved(true);
  }

  return (
    <section className="form-card">
      <h3>{copy.credentialWorkspace}</h3>
      <p>{copy.credentialSummary}</p>

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
          <span>{language === "zh" ? "密钥内容" : "Secret value"}</span>
          <input
            type="password"
            value={secretValue}
            onChange={(event) => setSecretValue(event.target.value)}
            placeholder="secret"
          />
        </label>
      </div>

      <button className="form-action" type="button" onClick={handleSave}>
        {language === "zh" ? "保存凭证" : "Save credential"}
      </button>
      {error ? <p className="error-banner">{error}</p> : null}
      {saved ? <p className="save-banner">{language === "zh" ? "凭证已保存" : "Credential saved"}</p> : null}
    </section>
  );
}
