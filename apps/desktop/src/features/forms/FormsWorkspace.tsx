import { useEffect, useState } from "react";

import { listAccounts, saveAccount, type AccountRecord } from "../accounts/api";
import {
  listCredentials,
  type CredentialRecord,
} from "../credentials/list-api";
import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";
import {
  listRepositories,
  type RepositoryRecord,
} from "../repositories/list-api";
import { AccountForm } from "./AccountForm";
import { CredentialForm } from "./CredentialForm";
import { RepositoryForm } from "./RepositoryForm";
import { LLMSettingsForm } from "../llm/LLMSettingsForm";

interface FormsWorkspaceProps {
  language: Language;
}

export function FormsWorkspace({ language }: FormsWorkspaceProps) {
  const copy = messages[language];
  const [savedState, setSavedState] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [repositories, setRepositories] = useState<RepositoryRecord[]>([]);

  async function refreshData() {
    const [accountsData, credentialsData, repositoriesData] = await Promise.all([
      listAccounts(),
      listCredentials(),
      listRepositories(),
    ]);
    setAccounts(Array.isArray(accountsData) ? accountsData : []);
    setCredentials(Array.isArray(credentialsData) ? credentialsData : []);
    setRepositories(Array.isArray(repositoriesData) ? repositoriesData : []);
  }

  useEffect(() => {
    void refreshData();
  }, []);

  async function handleSaveAccount(payload: {
    displayName: string;
    gitUsername: string;
    gitEmail: string;
    defaultAuthType: string;
  }) {
    await saveAccount(payload);
    await refreshData();
    setSavedState(language === "zh" ? "账户已保存" : "Account saved");
  }

  return (
    <section className="forms-workspace" aria-label="forms workspace">
      <AccountForm language={language} onSave={handleSaveAccount} />
      <CredentialForm
        language={language}
        accountOptions={accounts.map((item) => ({
          id: item.id,
          label: `${item.displayName} (${item.gitEmail})`,
        }))}
      />
      <RepositoryForm
        language={language}
        accountOptions={accounts.map((item) => ({
          id: item.id,
          label: `${item.displayName} (${item.gitEmail})`,
        }))}
        credentialOptions={credentials.map((item) => ({
          id: item.id,
          label: `${item.displayName} [${item.type}]`,
        }))}
      />
      {savedState ? <p className="save-banner">{savedState}</p> : null}
      <LLMSettingsForm language={language} />
      {repositories.length ? (
        <div className="summary-list">
          <h3>{language === "zh" ? "已保存仓库" : "Saved repositories"}</h3>
          {repositories.map((item) => (
            <p key={item.id}>
              {item.id}: {item.name}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
