import { RepositoryForm } from "../forms/RepositoryForm";
import type { Language } from "../i18n/i18n";
import type { RepositoryRecord } from "../repositories/list-api";

interface RepositoriesPageProps {
  language: Language;
  repositories: RepositoryRecord[];
  accountOptions: Array<{ id: string; label: string }>;
  credentialOptions: Array<{ id: string; label: string }>;
}

export function RepositoriesPage({
  language,
  repositories,
  accountOptions,
  credentialOptions,
}: RepositoriesPageProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="page-kicker">{language === "zh" ? "采集源配置" : "Collection source setup"}</p>
        <h1 className="page-title">{language === "zh" ? "仓库管理" : "Repositories"}</h1>
        <p className="page-subtitle">
          {language === "zh"
            ? "把远程仓库和账户、凭证、默认分支、作者过滤规则绑定在一起。"
            : "Bind remote repositories with accounts, credentials, branches, and author filters."}
        </p>
      </header>

      <RepositoryForm
        language={language}
        accountOptions={accountOptions}
        credentialOptions={credentialOptions}
      />

      <section className="workspace-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{language === "zh" ? "仓库概览" : "Repository overview"}</p>
            <h2>{language === "zh" ? "已绑定仓库" : "Bound repositories"}</h2>
          </div>
        </div>

        {repositories.length ? (
          <div className="list-table">
            <div className="list-row list-row--header">
              <span>{language === "zh" ? "名称" : "Name"}</span>
              <span>{language === "zh" ? "远程地址" : "Remote URL"}</span>
              <span>{language === "zh" ? "默认分支" : "Branch"}</span>
              <span>{language === "zh" ? "作者过滤" : "Author filter"}</span>
            </div>
            {repositories.map((item) => (
              <div className="list-row" key={item.id}>
                <span>{item.name}</span>
                <span className="truncate">{item.remoteUrl}</span>
                <span>{item.defaultBranch}</span>
                <span>{item.authorFilterValue || "—"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>{language === "zh" ? "还没有仓库" : "No repositories yet"}</h3>
            <p>
              {language === "zh"
                ? "保存第一个仓库后，你就可以在报告中心手动生成日报。"
                : "Save your first repository to unlock manual report generation in the report center."}
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
