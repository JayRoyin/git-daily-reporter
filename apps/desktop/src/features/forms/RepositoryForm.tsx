import { saveRepository } from "../repositories/api";
import { useState } from "react";

import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";

interface RepositoryFormProps {
  language: Language;
  accountOptions: Array<{ id: string; label: string }>;
  credentialOptions: Array<{ id: string; label: string }>;
  onSaved?: () => Promise<void> | void;
}

export function RepositoryForm({
  language,
  accountOptions,
  credentialOptions,
  onSaved,
}: RepositoryFormProps) {
  const copy = messages[language];
  const [accountId, setAccountId] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [name, setName] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("");
  const [authorFilterValue, setAuthorFilterValue] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await saveRepository({
      accountId,
      credentialId,
      name,
      localPath,
      remoteUrl,
      defaultBranch,
      authorFilterValue,
    });
    await onSaved?.();
    setSaved(true);
  }

  return (
    <section className="form-card">
      <h3>{copy.repositoryWorkspace}</h3>
      <p>{copy.repositorySummary}</p>

      <div className="form-grid">
        <label className="form-field">
          <span>{language === "zh" ? "账户" : "Account"}</span>
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
          <span>{language === "zh" ? "凭证" : "Credential"}</span>
          <select
            value={credentialId}
            onChange={(event) => setCredentialId(event.target.value)}
          >
            <option value="">{language === "zh" ? "请选择凭证" : "Select credential"}</option>
            {credentialOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "仓库名称" : "Repository name"}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="git-daily-reporter" />
        </label>

        <label className="form-field">
          <span>{language === "zh" ? "本地仓库路径" : "Local repository path"}</span>
          <input value={localPath} onChange={(event) => setLocalPath(event.target.value)} placeholder="/home/qstdc/project/repo" />
        </label>

        <label className="form-field">
          <span>{copy.remoteUrl}</span>
          <input
            value={remoteUrl}
            onChange={(event) => setRemoteUrl(event.target.value)}
            placeholder="git@github.com:owner/repo.git"
          />
        </label>

        <label className="form-field">
          <span>{copy.defaultBranch}</span>
          <input
            value={defaultBranch}
            onChange={(event) => setDefaultBranch(event.target.value)}
            placeholder={copy.branchHint}
          />
        </label>

        <label className="form-field">
          <span>{copy.authorFilter}</span>
          <input
            value={authorFilterValue}
            onChange={(event) => setAuthorFilterValue(event.target.value)}
            placeholder="qstdc@example.com"
          />
        </label>
      </div>

      <button className="form-action" type="button" onClick={handleSave}>
        {language === "zh" ? "保存仓库" : "Save repository"}
      </button>
      {saved ? <p className="save-banner">{language === "zh" ? "仓库已保存" : "Repository saved"}</p> : null}
    </section>
  );
}
