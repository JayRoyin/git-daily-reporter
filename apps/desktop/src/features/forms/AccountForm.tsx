import { useState } from "react";

import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";

interface AccountFormProps {
  language: Language;
  onSave?: (payload: {
    displayName: string;
    gitUsername: string;
    gitEmail: string;
    defaultAuthType: string;
  }) => Promise<void> | void;
}

export function AccountForm({ language, onSave }: AccountFormProps) {
  const copy = messages[language];
  const [displayName, setDisplayName] = useState("");
  const [gitUsername, setGitUsername] = useState("");
  const [gitEmail, setGitEmail] = useState("");
  const [defaultAuthType, setDefaultAuthType] = useState("ssh");

  return (
    <section className="form-card">
      <h3>{copy.accountWorkspace}</h3>
      <p>{copy.accountSummary}</p>

      <div className="form-grid">
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
      </div>

      <button
        className="form-action"
        type="button"
        onClick={() =>
          onSave?.({
            displayName,
            gitUsername,
            gitEmail,
            defaultAuthType,
          })
        }
      >
        {language === "zh" ? "保存账户" : "Save account"}
      </button>
    </section>
  );
}
