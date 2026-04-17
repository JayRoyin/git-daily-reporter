import { useEffect, useState } from "react";

import { describeError } from "../../lib/errors";
import type { Language } from "../i18n/i18n";
import { listProviders } from "../llm/provider-api";
import {
  listRepositories,
  type RepositoryRecord,
} from "../repositories/list-api";
import { ReportHistory, type ReportHistoryRecord } from "./ReportHistory";
import { generateReport, listReportRuns } from "./api";
import { ReportSummary } from "./ReportSummary";

interface ReportsWorkspaceProps {
  language: Language;
}

function todayLocalIsoDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function ReportsWorkspace({ language }: ReportsWorkspaceProps) {
  const [repositoryId, setRepositoryId] = useState("");
  const [repositories, setRepositories] = useState<RepositoryRecord[]>([]);
  const [reportDate, setReportDate] = useState(todayLocalIsoDate());
  const [outputPath, setOutputPath] = useState("");
  const [content, setContent] = useState("");
  const [hasProvider, setHasProvider] = useState(false);
  const [history, setHistory] = useState<ReportHistoryRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [items, providers, reportRuns] = await Promise.all([
          listRepositories(),
          listProviders(),
          listReportRuns(),
        ]);
        setRepositories(Array.isArray(items) ? items : []);
        setHasProvider(Array.isArray(providers) && providers.length > 0);
        setHistory(Array.isArray(reportRuns) ? reportRuns : []);
        setError("");
      } catch (err) {
        setError(describeError(err, "Unknown report workspace error"));
      }
    })();
  }, []);

  async function handleGenerate() {
    if (!repositoryId) {
      setError(language === "zh" ? "请先选择仓库" : "Please select a repository first");
      return;
    }

    if (!reportDate) {
      setError(language === "zh" ? "请先选择报告日期" : "Please choose a report date");
      return;
    }

    try {
      const result = await generateReport({ repositoryId, reportDate });
      setOutputPath(result.outputPath);
      setContent(result.content);
      setHistory((current) => [
        {
          id: `${repositoryId}-${reportDate}`,
          repositoryId,
          reportDate,
          outputPath: result.outputPath,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setError("");
    } catch (err) {
      setError(describeError(err, "Unknown report generation error"));
    }
  }

  return (
    <section className="report-card">
      <h3>{language === "zh" ? "手动生成日报" : "Manual Report Generator"}</h3>
      <div className="form-grid">
        <label className="form-field">
          <span>{language === "zh" ? "仓库" : "Repository"}</span>
          <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>
            <option value="">{language === "zh" ? "请选择仓库" : "Select repository"}</option>
            {repositories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.id})
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>{language === "zh" ? "报告日期" : "Report date"}</span>
          <input
            type="date"
            value={reportDate}
            onChange={(event) => setReportDate(event.target.value)}
          />
        </label>
      </div>
      <button className="form-action" type="button" onClick={handleGenerate}>
        {language === "zh" ? "生成日报" : "Generate report"}
      </button>
      {error ? <p className="error-banner">{error}</p> : null}

      {outputPath ? (
        <div className="report-output">
          <p>{outputPath}</p>
          <pre>{content}</pre>
          <ReportSummary
            language={language}
            reportContent={content}
            hasProvider={hasProvider}
          />
        </div>
      ) : null}

      <ReportHistory language={language} records={history} />
    </section>
  );
}
