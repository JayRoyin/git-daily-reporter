# Git Daily Reporter

[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-2ea44f.svg)](#)
[![Desktop](https://img.shields.io/badge/app-Tauri%20Desktop-24c8db.svg)](#)
[![Frontend](https://img.shields.io/badge/frontend-React-61dafb.svg)](#)
[![Backend](https://img.shields.io/badge/backend-Rust-dea584.svg)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-planning%20%2B%20prototype-orange.svg)](#)

Git Daily Reporter 是一个正在落地的跨平台桌面客户端，用来把 Git 仓库活动自动整理成日报、周报和其他可定制总结。

当前产品方向已经收敛为：

- 支持 `Linux` 和 `Windows`
- 应用内单独管理 Git 账户
- 应用内单独管理 SSH 密钥
- 兼容 `GitHub Personal Access Token`
- 支持多账户、多仓库绑定
- 支持自定义总结时间和统计时间窗口
- 支持模板化输出
- 后续支持 AI 总结增强

## 仓库结构

```text
git-daily-reporter/
├── apps/
│   └── desktop/                # 正式桌面客户端目录
├── docs/                       # 正式文档
├── prototypes/
│   └── python-cli/             # 原型归档，仅供参考
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

说明：

- `apps/desktop/` 是接下来正式开发的主目录
- `docs/` 是单一真相来源
- `prototypes/python-cli/` 保留原型验证成果，但不再代表正式架构

## 当前状态

目前仓库包含两部分：

### 1. 正式文档

已经完成：

- 客户端总体方案设计
- 详细技术设计
- 按版本执行计划
- 实施路线和坑点分析

### 2. Python CLI 原型归档

它用于证明以下链路可行：

- Git 活动采集
- 模板渲染
- Markdown 报告输出
- 基础测试

## 项目路线

正式版本推荐路线：

- 客户端框架：`Tauri`
- 后端核心：`Rust`
- 前端：`React`
- 数据库：`SQLite`
- 敏感信息存储：`Stronghold`

Python CLI 仅作为参考实现，不作为最终桌面客户端架构。

## 文档

- 总体方案: [方案设计.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/方案设计.md)
- 详细技术设计: [详细技术设计.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/详细技术设计.md)
- 客户端实施计划: [实施计划.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/实施计划.md)
- 按版本执行计划: [版本执行计划.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/版本执行计划.md)
- 开发环境建议: [开发环境建议.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/开发环境建议.md)

## 原型归档

当前归档原型已实现：

- YAML 配置读取
- 指定日期采集 Git 提交
- 文件增删统计
- Jinja2 模板渲染
- Markdown 日报生成

相关文件：

- [cli.py](/home/qstdc/Royin_Project/git-daily-reporter/prototypes/python-cli/src/git_daily_reporter/cli.py)
- [collector.py](/home/qstdc/Royin_Project/git-daily-reporter/prototypes/python-cli/src/git_daily_reporter/collector.py)
- [template_engine.py](/home/qstdc/Royin_Project/git-daily-reporter/prototypes/python-cli/src/git_daily_reporter/template_engine.py)

## 推荐 IDE

如果只选一个，我建议你用 `Visual Studio Code`。

原因：

- 对 `Tauri + Rust + React` 组合支持最好
- Linux 和 Windows 体验一致
- 插件成熟
- 更适合当前这种多技术栈、快速演进的项目

详细建议见 [开发环境建议.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/开发环境建议.md)。

## 开源协议

本项目当前使用 [MIT License](/home/qstdc/Royin_Project/git-daily-reporter/LICENSE)。

## 下一步

项目应当严格按 [版本执行计划.md](/home/qstdc/Royin_Project/git-daily-reporter/docs/版本执行计划.md) 推进。

当前应执行的下一步是：

1. 完成仓库规范化
2. 初始化 `apps/desktop/` 的 Tauri 工程
3. 建立数据模型和设置页骨架
4. 再进入凭证、安全和 Git 访问层
