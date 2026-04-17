import { useState } from "react";

import { AboutPage } from "./features/about/AboutPage";
import { useDesktopWorkspace } from "./features/forms/FormsWorkspace";
import { messages, type Language } from "./features/i18n/i18n";
import { AccountsPage } from "./features/workbench/AccountsPage";
import { CredentialsPage } from "./features/workbench/CredentialsPage";
import { DashboardPage } from "./features/workbench/DashboardPage";
import { ReportsPage } from "./features/workbench/ReportsPage";
import { RepositoriesPage } from "./features/workbench/RepositoriesPage";

type PageId =
  | "dashboard"
  | "accounts"
  | "credentials"
  | "repositories"
  | "reports"
  | "about";

const NAV_ITEMS: Array<{ id: PageId; label: { zh: string; en: string }; icon: string }> = [
  { id: "dashboard", label: { zh: "仪表盘", en: "Dashboard" }, icon: "▣" },
  { id: "accounts", label: { zh: "账户管理", en: "Accounts" }, icon: "◎" },
  { id: "credentials", label: { zh: "凭证管理", en: "Credentials" }, icon: "◎" },
  { id: "repositories", label: { zh: "仓库管理", en: "Repositories" }, icon: "▣" },
  { id: "reports", label: { zh: "报告中心", en: "Reports" }, icon: "◎" },
  { id: "about", label: { zh: "关于", en: "About" }, icon: "◎" },
];

function App() {
  const [language, setLanguage] = useState<Language>("zh");
  const [page, setPage] = useState<PageId>("dashboard");
  const copy = messages[language];
  const workspace = useDesktopWorkspace(language);

  function renderPage() {
    switch (page) {
      case "accounts":
        return (
          <AccountsPage
            language={language}
            accounts={workspace.accounts}
            onSaveAccount={workspace.handleSaveAccount}
            saveMessage={workspace.savedState}
          />
        );
      case "credentials":
        return (
          <CredentialsPage
            language={language}
            credentials={workspace.credentials}
            accountOptions={workspace.accountOptions}
            onSavedCredential={workspace.refreshData}
          />
        );
      case "repositories":
        return (
          <RepositoriesPage
            language={language}
            repositories={workspace.repositories}
            accountOptions={workspace.accountOptions}
            credentialOptions={workspace.credentialOptions}
            onSavedRepository={workspace.refreshData}
          />
        );
      case "reports":
        return <ReportsPage language={language} />;
      case "about":
        return <AboutPage language={language} />;
      case "dashboard":
      default:
        return <DashboardPage language={language} />;
    }
  }

  return (
    <main className="desktop-shell">
      <header className="window-bar">
        <div className="window-brand">
          <span className="window-dot window-dot--red" />
          <span className="window-dot window-dot--amber" />
          <span className="window-dot window-dot--green" />
          <div>
            <strong>Git Daily Reporter</strong>
            <span>{language === "zh" ? "开发者日报工作台" : "Developer report workbench"}</span>
          </div>
        </div>
        <div className="language-toggle" role="group" aria-label="language switcher">
          <button
            className={`lang-button ${language === "en" ? "active" : ""}`}
            type="button"
            onClick={() => setLanguage("en")}
          >
            {copy.english}
          </button>
          <button
            className={`lang-button ${language === "zh" ? "active" : ""}`}
            type="button"
            onClick={() => setLanguage("zh")}
          >
            {copy.chinese}
          </button>
        </div>
      </header>

      <div className="workbench-layout">
        <aside className="sidebar" aria-label="primary navigation">
          <div className="sidebar-brand">
            <p>{language === "zh" ? "Git 日报工作台" : "Git Report Desk"}</p>
            <span>{language === "zh" ? "本地采集、总结与输出" : "Collect, summarize, and export locally"}</span>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const label = item.label[language];
              const isActive = page === item.id;

              return (
                <button
                  key={item.id}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  type="button"
                  onClick={() => setPage(item.id)}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="content-shell">{renderPage()}</section>
      </div>
    </main>
  );
}

export default App;
