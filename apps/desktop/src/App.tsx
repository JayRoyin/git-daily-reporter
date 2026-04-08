import { useState } from "react";

import { AboutPage } from "./features/about/AboutPage";
import { FormsWorkspace } from "./features/forms/FormsWorkspace";
import { messages, type Language } from "./features/i18n/i18n";
import { ReportsWorkspace } from "./features/reports/ReportsWorkspace";
import { SecurityShell } from "./features/security/SecurityShell";
import { VaultProvider } from "./features/security/VaultContext";
import { SettingsShell } from "./features/settings/SettingsShell";

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [page, setPage] = useState<"workspace" | "about">("workspace");
  const copy = messages[language];

  return (
    <VaultProvider>
      <main className="shell">
        <div className="toolbar" aria-label="global toolbar">
          <button
            className="about-link"
            type="button"
            onClick={() => setPage(page === "workspace" ? "about" : "workspace")}
          >
            {page === "workspace"
              ? language === "zh"
                ? "关于"
                : "About"
              : language === "zh"
                ? "返回"
                : "Back"}
          </button>
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
        </div>

        {page === "about" ? (
          <AboutPage language={language} />
        ) : (
          <>
            <section className="hero">
              <p className="eyebrow">{copy.planningShell}</p>
              <h1>Git Daily Reporter</h1>
              <p className="summary">{copy.appSummary}</p>
            </section>

            <section className="status-grid" aria-label="project overview">
              <article className="status-card">
                <h2>Desktop</h2>
                <p>{copy.desktopInitialized}</p>
              </article>
              <article className="status-card">
                <h2>Next Phase</h2>
                <p>{copy.nextPhase}</p>
              </article>
            </section>

            <SettingsShell language={language} />
            <SecurityShell language={language} />
            <FormsWorkspace language={language} />
            <ReportsWorkspace language={language} />
          </>
        )}
      </main>
    </VaultProvider>
  );
}

export default App;
