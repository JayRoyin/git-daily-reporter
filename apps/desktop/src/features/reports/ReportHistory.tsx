import type { Language } from "../i18n/i18n";

export interface ReportHistoryRecord {
  id: string;
  repositoryId: string;
  reportDate: string;
  outputPath: string;
  createdAt: string;
}

interface ReportHistoryProps {
  language: Language;
  records: ReportHistoryRecord[];
}

export function ReportHistory({ language, records }: ReportHistoryProps) {
  if (!records.length) {
    return null;
  }

  return (
    <section className="summary-list">
      <h3>{language === "zh" ? "最近报告" : "Recent reports"}</h3>
      {records.map((record) => (
        <div key={record.id} className="history-row">
          <p>{record.reportDate}</p>
          <p className="truncate">{record.outputPath}</p>
        </div>
      ))}
    </section>
  );
}
