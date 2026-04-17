import { useEffect, useState } from "react";

import type { Language } from "../i18n/i18n";
import { generateReport } from "./api";
import { listReportRuns } from "./api";
import {
  listRepositories,
  type RepositoryRecord,
} from "../repositories/list-api";
import { listProviders } from "../llm/provider-api";
import { ReportSummary } from "./ReportSummary";
import { ReportHistory, type ReportHistoryRecord } from "./ReportHistory";

interface ReportsWorkspaceProps {
  language: Language;
}

export function ReportsWorkspace({ language }: ReportsWorkspaceProps) {
  const [repositoryId, setRepositoryId] = useState("");
  const [repositories, setRepositories] = useState<RepositoryRecord[]>([]);
  const [reportDate, setReportDate] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [content, setContent] = useState("");
  const [hasProvider, setHasProvider] = useState(false);
  const [history, setHistory] = useState<ReportHistoryRecord[]>([]);

  useEffect(() => {
    void (async () => {
      const [items, providers, reportRuns] = await Promise.all([
        listRepositories(),
        listProviders(),
        listReportRuns(),
      ]);
      setRepositories(Array.isArray(items) ? items : []);
      setHasProvider(Array.isArray(providers) && providers.length > 0);
      setHistory(Array.isArray(reportRuns) ? reportRuns : []);
    })();
  }, []);

  async function handleGenerate() {
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
          <input value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
        </label>
      </div>
      <button className="form-action" type="button" onClick={handleGenerate}>
        {language === "zh" ? "生成日报" : "Generate report"}
      </button>

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
