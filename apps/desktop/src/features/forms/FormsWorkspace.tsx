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

export function useDesktopWorkspace(language: Language) {
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
    platform: string;
    platformBaseUrl?: string;
    displayName: string;
    gitUsername: string;
    gitEmail: string;
    defaultAuthType: string;
  }) {
    await saveAccount(payload);
    await refreshData();
    setSavedState(language === "zh" ? "账户已保存" : "Account saved");
  }

  return {
    accounts,
    credentials,
    repositories,
    savedState,
    refreshData,
    handleSaveAccount,
    accountOptions: accounts.map((item) => ({
      id: item.id,
      label: `${item.displayName} [${item.platform}] (${item.gitEmail})`,
    })),
    credentialOptions: credentials.map((item) => ({
      id: item.id,
      label: `${item.displayName} [${item.type}]`,
    })),
  };
}

interface FormsWorkspaceProps {
  language: Language;
}

export function FormsWorkspace({ language }: FormsWorkspaceProps) {
  const copy = messages[language];
  const {
    repositories,
    savedState,
    handleSaveAccount,
    accountOptions,
    credentialOptions,
  } = useDesktopWorkspace(language);

  return (
    <section className="forms-workspace" aria-label="forms workspace">
      <AccountForm language={language} onSave={handleSaveAccount} />
      <CredentialForm
        language={language}
        accountOptions={accountOptions}
      />
      <RepositoryForm
        language={language}
        accountOptions={accountOptions}
        credentialOptions={credentialOptions}
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
