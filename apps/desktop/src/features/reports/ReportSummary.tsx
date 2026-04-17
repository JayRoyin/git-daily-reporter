import { useState } from "react";

import type { Language } from "../i18n/i18n";
import { summarizeReport } from "../llm/llm-client";

interface ReportSummaryProps {
  language: Language;
  reportContent: string;
  hasProvider: boolean;
}

export function ReportSummary({
  language,
  reportContent,
  hasProvider,
}: ReportSummaryProps) {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      const result = await summarizeReport(reportContent);
      setSummary(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown LLM error");
    }
  }

  return (
    <section className="report-summary">
      <button
        className="form-action"
        type="button"
        onClick={handleGenerate}
        disabled={!hasProvider || !reportContent}
      >
        {language === "zh" ? "生成 AI 总结" : "Generate AI summary"}
      </button>

      {error ? <p className="error-banner">{error}</p> : null}
      {summary ? <pre>{summary}</pre> : null}
    </section>
  );
}
