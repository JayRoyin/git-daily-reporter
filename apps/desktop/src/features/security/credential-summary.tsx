import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";

interface CredentialSummaryProps {
  language: Language;
}

export function CredentialSummary({ language }: CredentialSummaryProps) {
  const copy = messages[language];
  const placeholders = [
    {
      title: copy.sshKey,
      detail: "Fingerprint and metadata only. Private key never rendered.",
    },
    {
      title: copy.githubToken,
      detail: "Token label and last verified timestamp only. Value redacted.",
    },
  ];

  return (
    <section className="credential-summary" aria-label="credential summary">
      <h3>{copy.credentialPlaceholders}</h3>
      <div className="credential-grid">
        {placeholders.map((item) => (
          <article key={item.title} className="credential-card">
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
            <p className="chip chip--neutral">{copy.storedSecurely}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
