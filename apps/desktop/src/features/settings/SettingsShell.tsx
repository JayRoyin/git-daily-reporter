import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";
import { SETTINGS_SECTIONS } from "./settings-data";

interface SettingsShellProps {
  language: Language;
}

export function SettingsShell({ language }: SettingsShellProps) {
  const copy = messages[language];

  return (
    <section className="settings-shell" aria-label="settings workspace">
      <header className="settings-header">
        <p className="eyebrow">V0.3</p>
        <h2>{copy.workspaceSetup}</h2>
        <p className="summary">
          Core settings domains for accounts, credentials, repositories,
          schedules, and templates.
        </p>
      </header>

      <div className="settings-grid">
        {SETTINGS_SECTIONS.map((section) => (
          <article className="settings-card" key={section.id}>
            <div className="settings-card__meta">
              <p className="settings-card__id">{section.id}</p>
              <p className="settings-card__status">{section.status}</p>
            </div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
