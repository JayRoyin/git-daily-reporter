import type { Language } from "../i18n/i18n";

interface AboutPageProps {
  language: Language;
}

export function AboutPage({ language }: AboutPageProps) {
  return (
    <section className="about-page">
      <h2>{language === "zh" ? "关于 Git Daily Reporter" : "About Git Daily Reporter"}</h2>
      <p>Version 1.0.0-beta</p>
      <p>
        {language === "zh"
          ? "桌面里程碑：V1 完整基础能力"
          : "Desktop milestone: V1 complete foundation"}
      </p>
    </section>
  );
}
