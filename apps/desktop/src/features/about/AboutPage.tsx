import type { Language } from "../i18n/i18n";

interface AboutPageProps {
  language: Language;
}

export function AboutPage({ language }: AboutPageProps) {
  return (
    <section className="about-page">
      <p className="page-kicker">{language === "zh" ? "项目信息" : "Project info"}</p>
      <h2>{language === "zh" ? "关于 Git Daily Reporter" : "About Git Daily Reporter"}</h2>
      <p>{language === "zh" ? "版本：1.0.0-beta" : "Version: 1.0.0-beta"}</p>
      <p>
        {language === "zh"
          ? "这是一个面向开发者的桌面日报工作台，用于管理账户、凭证、仓库和本地化报告生成流程。"
          : "This desktop workbench is designed for developers who want to manage accounts, credentials, repositories, and local report generation in one place."}
      </p>
      <p>
        {language === "zh"
          ? "当前界面已经切换为左侧导航工作台形态，后续能力会继续围绕仓库采集、调度和 AI 总结扩展。"
          : "The current interface has moved to a left-navigation workbench, and future iterations will keep expanding around repository collection, scheduling, and AI summaries."}
      </p>
    </section>
  );
}
