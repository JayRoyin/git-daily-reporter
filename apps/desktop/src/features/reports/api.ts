import { invokeOrDefault, invokeOrThrow } from "../../lib/tauri";

export interface GenerateReportPayload {
  repositoryId: string;
  reportDate: string;
}

export interface GenerateReportResult {
  outputPath: string;
  content: string;
}

export interface ReportRunRecord {
  id: string;
  repositoryId: string;
  reportDate: string;
  outputPath: string;
  createdAt: string;
}

export async function generateReport(payload: GenerateReportPayload) {
  return invokeOrThrow<GenerateReportResult>("generate_report", { payload });
}

export async function listReportRuns() {
  return invokeOrDefault<ReportRunRecord[]>("list_report_runs", []);
}
