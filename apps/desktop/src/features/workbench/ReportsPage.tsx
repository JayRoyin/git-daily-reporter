import type { Language } from "../i18n/i18n";
import { ReportsWorkspace } from "../reports/ReportsWorkspace";

interface ReportsPageProps {
  language: Language;
}

export function ReportsPage({ language }: ReportsPageProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="page-kicker">{language === "zh" ? "输出与总结" : "Output and summaries"}</p>
        <h1 className="page-title">{language === "zh" ? "报告中心" : "Report Center"}</h1>
        <p className="page-subtitle">
          {language === "zh"
            ? "手动生成日报，查看历史输出，并在已配置提供方时追加 AI 总结。"
            : "Generate manual reports, review output history, and add AI summaries when providers are configured."}
        </p>
      </header>

      <ReportsWorkspace language={language} />
    </section>
  );
}
