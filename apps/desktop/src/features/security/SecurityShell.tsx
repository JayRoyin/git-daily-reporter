import type { Language } from "../i18n/i18n";
import { messages } from "../i18n/i18n";
import { useVault } from "./VaultContext";
import { CredentialSummary } from "./credential-summary";

interface SecurityShellProps {
  language: Language;
}

export function SecurityShell({ language }: SecurityShellProps) {
  const copy = messages[language];
  const {
    masterPassword,
    setMasterPassword,
    isUnlocked,
    unlock,
    lock,
  } = useVault();

  const canUnlock = masterPassword.trim().length >= 8;

  return (
    <section className="security-shell" aria-label="security vault">
      <header className="security-header">
        <p className="eyebrow">V0.4</p>
        <h2>{copy.securityVault}</h2>
        <p className="summary">
          Master-password gate and credential placeholders for SSH keys and
          GitHub access tokens.
        </p>
      </header>

      <div className="vault-controls">
        <label className="vault-label" htmlFor="master-password">
          {copy.masterPassword}
        </label>
        <input
          id="master-password"
          className="vault-input"
          type="password"
          value={masterPassword}
          onChange={(event) => setMasterPassword(event.target.value)}
          placeholder="Enter at least 8 characters"
        />

        {isUnlocked ? (
          <button
            className="vault-button danger"
            type="button"
            onClick={lock}
          >
            {copy.lockVault}
          </button>
        ) : (
          <button
            className="vault-button"
            type="button"
            disabled={!canUnlock}
            onClick={unlock}
          >
            {copy.unlockVault}
          </button>
        )}
      </div>

      <div className="vault-status">
        <p className={`chip ${isUnlocked ? "chip--ok" : "chip--warn"}`}>
          {isUnlocked ? copy.vaultUnlocked : copy.vaultLocked}
        </p>
        <p>{isUnlocked ? copy.sessionActive : copy.sessionLocked}</p>
      </div>

      <CredentialSummary language={language} />
    </section>
  );
}
