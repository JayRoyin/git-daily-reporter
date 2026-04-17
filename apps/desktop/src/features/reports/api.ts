import { invoke } from "@tauri-apps/api/core";

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
  return invoke<GenerateReportResult>("generate_report", { payload });
}

export async function listReportRuns() {
  return invoke<ReportRunRecord[]>("list_report_runs");
}
