import type { Language } from "../i18n/i18n";
import { AccountForm } from "../forms/AccountForm";
import type { AccountRecord } from "../accounts/api";

interface AccountsPageProps {
  language: Language;
  accounts: AccountRecord[];
  onSaveAccount: (payload: {
    platform: string;
    platformBaseUrl?: string;
    displayName: string;
    gitUsername: string;
    gitEmail: string;
    defaultAuthType: string;
  }) => Promise<void>;
  saveMessage: string;
}

export function AccountsPage({
  language,
  accounts,
  onSaveAccount,
  saveMessage,
}: AccountsPageProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="page-kicker">{language === "zh" ? "Git 身份管理" : "Git identity management"}</p>
        <h1 className="page-title">{language === "zh" ? "账户管理" : "Accounts"}</h1>
        <p className="page-subtitle">
          {language === "zh"
            ? "维护不同平台的 Git 身份，为仓库和凭证绑定提供清晰的账户边界。"
            : "Maintain Git identities per platform and keep repository and credential bindings explicit."}
        </p>
      </header>

      <AccountForm language={language} onSave={onSaveAccount} />

      <section className="workspace-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{language === "zh" ? "已保存账户" : "Saved accounts"}</p>
            <h2>{language === "zh" ? "账户列表" : "Account list"}</h2>
          </div>
        </div>

        {saveMessage ? <p className="save-banner">{saveMessage}</p> : null}

        {accounts.length ? (
          <div className="list-table">
            <div className="list-row list-row--header">
              <span>{language === "zh" ? "平台" : "Platform"}</span>
              <span>{language === "zh" ? "显示名" : "Display name"}</span>
              <span>{language === "zh" ? "Git 用户名" : "Git username"}</span>
              <span>{language === "zh" ? "验证状态" : "Verification status"}</span>
            </div>
            {accounts.map((item) => (
              <div className="list-row" key={item.id}>
                <span>{item.platform}</span>
                <span>{item.displayName}</span>
                <span>{item.gitUsername}</span>
                <span>{item.verificationStatus}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>{language === "zh" ? "还没有账户" : "No accounts yet"}</h3>
            <p>
              {language === "zh"
                ? "先创建一个 Git 身份，后续仓库和凭证都可以挂到这个账户下面。"
                : "Create a Git identity first, then bind repositories and credentials under it."}
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
