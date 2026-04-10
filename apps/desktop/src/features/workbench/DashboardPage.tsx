import { useEffect, useState } from "react";

import { listAccounts } from "../accounts/api";
import { listCredentials, type CredentialRecord } from "../credentials/list-api";
import type { Language } from "../i18n/i18n";
import { listProviders } from "../llm/provider-api";
import { listRepositories, type RepositoryRecord } from "../repositories/list-api";
import { listReportRuns, type ReportRunRecord } from "../reports/api";

interface DashboardPageProps {
  language: Language;
}

interface DashboardState {
  accounts: Array<{
    id: string;
    platform: string;
    displayName: string;
    gitEmail: string;
    verificationStatus: string;
  }>;
  credentials: CredentialRecord[];
  repositories: RepositoryRecord[];
  reportRuns: ReportRunRecord[];
  providers: Array<{ id: string; testStatus: string }>;
}

const EMPTY_STATE: DashboardState = {
  accounts: [],
  credentials: [],
  repositories: [],
  reportRuns: [],
  providers: [],
};

export function DashboardPage({ language }: DashboardPageProps) {
  const [state, setState] = useState<DashboardState>(EMPTY_STATE);

  useEffect(() => {
    void (async () => {
      const [accounts, credentials, repositories, reportRuns, providers] = await Promise.all([
        listAccounts(),
        listCredentials(),
        listRepositories(),
        listReportRuns(),
        listProviders(),
      ]);

      setState({
        accounts: Array.isArray(accounts) ? accounts : [],
        credentials: Array.isArray(credentials) ? credentials : [],
        repositories: Array.isArray(repositories) ? repositories : [],
        reportRuns: Array.isArray(reportRuns) ? reportRuns : [],
        providers: Array.isArray(providers) ? providers : [],
      });
    })();
  }, []);

  const latestRun = state.reportRuns[0];

  const stats = [
    {
      label: language === "zh" ? "账户数量" : "Accounts",
      value: state.accounts.length,
      hint:
        state.accounts[0]?.displayName ??
        (language === "zh" ? "还没有 Git 身份" : "No Git identities yet"),
    },
    {
      label: language === "zh" ? "凭证数量" : "Credentials",
      value: state.credentials.length,
      hint:
        state.credentials[0]?.displayName ??
        (language === "zh" ? "等待录入 SSH 或 Token" : "Waiting for SSH or token setup"),
    },
    {
      label: language === "zh" ? "仓库数量" : "Repositories",
      value: state.repositories.length,
      hint:
        state.repositories[0]?.name ??
        (language === "zh" ? "还没有仓库绑定" : "No repositories bound yet"),
    },
    {
      label: language === "zh" ? "LLM 提供方" : "LLM Providers",
      value: state.providers.length,
      hint:
        state.providers.length > 0
          ? language === "zh"
            ? "可用于 AI 总结增强"
            : "Ready for AI report enrichment"
          : language === "zh"
            ? "尚未配置"
            : "Not configured",
    },
  ];

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="page-kicker">
          {language === "zh" ? "开发者日报工作台" : "Developer reporting workbench"}
        </p>
        <h1 className="page-title">{language === "zh" ? "仪表盘" : "Dashboard"}</h1>
        <p className="page-subtitle">
          {language === "zh"
            ? "把账户、凭证、仓库和日报生成流程集中在一个桌面工作台里。"
            : "Bring accounts, credentials, repositories, and report generation into one desktop workbench."}
        </p>
      </header>

      <section className="dashboard-grid" aria-label="dashboard stats">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <p className="stat-label">{item.label}</p>
            <p className="stat-value">{item.value}</p>
            <p className="stat-hint">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="workspace-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{language === "zh" ? "最近活动" : "Recent activity"}</p>
            <h2>
              {language === "zh" ? "最近一次日报生成" : "Latest report generation"}
            </h2>
          </div>
        </div>

        {latestRun ? (
          <div className="detail-grid">
            <div className="detail-card">
              <span>{language === "zh" ? "报告日期" : "Report date"}</span>
              <strong>{latestRun.reportDate}</strong>
            </div>
            <div className="detail-card">
              <span>{language === "zh" ? "生成时间" : "Generated at"}</span>
              <strong>{new Date(latestRun.createdAt).toLocaleString()}</strong>
            </div>
            <div className="detail-card detail-card--wide">
              <span>{language === "zh" ? "输出路径" : "Output path"}</span>
              <strong>{latestRun.outputPath}</strong>
            </div>
          </div>
        ) : (
          <div className="empty-panel">
            <h3>{language === "zh" ? "还没有日报记录" : "No report history yet"}</h3>
            <p>
              {language === "zh"
                ? "先完成仓库绑定，然后到报告中心手动生成第一份日报。"
                : "Bind a repository first, then generate your first report from the report center."}
            </p>
          </div>
        )}
      </section>

      <section className="workspace-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{language === "zh" ? "启动建议" : "Getting started"}</p>
            <h2>{language === "zh" ? "建议流程" : "Suggested flow"}</h2>
          </div>
        </div>
        <div className="checklist">
          <div className="checklist-item">
            <span className={`checklist-dot ${state.accounts.length ? "done" : ""}`} />
            <div>
              <strong>{language === "zh" ? "1. 添加账户" : "1. Add accounts"}</strong>
              <p>
                {language === "zh"
                  ? "配置平台、Git 身份、邮箱，并执行登录校验。"
                  : "Configure Git identities, email, and default authentication."}
              </p>
            </div>
          </div>
          <div className="checklist-item">
            <span className={`checklist-dot ${state.credentials.length ? "done" : ""}`} />
            <div>
              <strong>{language === "zh" ? "2. 导入凭证与令牌" : "2. Import credentials and tokens"}</strong>
              <p>
                {language === "zh"
                  ? "自动扫描 SSH 密钥或手动录入 Token，系统默认以掩码展示敏感值。"
                  : "Discover SSH keys or add tokens manually with masked secret display by default."}
              </p>
            </div>
          </div>
          <div className={`checklist-item ${state.repositories.length ? "" : "muted"}`}>
            <span className={`checklist-dot ${state.repositories.length ? "done" : ""}`} />
            <div>
              <strong>{language === "zh" ? "3. 绑定仓库并生成日报" : "3. Bind repositories and generate reports"}</strong>
              <p>
                {language === "zh"
                  ? "完成仓库配置后，就可以在报告中心生成日报和 AI 总结。"
                  : "After repository setup, use the report center for report generation and AI summaries."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
