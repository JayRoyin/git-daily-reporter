# Git Daily Reporter

[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-2ea44f.svg)](#)
[![Desktop](https://img.shields.io/badge/app-Tauri%20Desktop-24c8db.svg)](#)
[![Frontend](https://img.shields.io/badge/frontend-React-61dafb.svg)](#)
[![Backend](https://img.shields.io/badge/backend-Rust-dea584.svg)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-v1%20usable-blue.svg)](#)

Git Daily Reporter 是一个可试用的跨平台桌面客户端，用来把 Git 仓库活动自动整理成日报和 AI 增强总结。

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

## 当前 V1 能力

当前版本已经可以：

- 启动桌面应用
- 切换中英文
- 配置账户 / 凭证 / 仓库
- 使用保险库保存敏感信息
- 生成基于本地 Git 仓库的日报
- 生成包含作者过滤和文件统计的 Markdown 报告
- 配置 LLM 提供方
- 测试 LLM 提供方连接
- 生成 AI summary
- 查看最近报告历史

## 项目路线

正式版本推荐路线：

- 客户端框架：`Tauri`
- 后端核心：`Rust`
- 前端：`React`
- 数据库：`SQLite`
- 敏感信息存储：`Stronghold`

Python CLI 仅作为参考实现，不作为最终桌面客户端架构。

## 文档

- 总体方案: [docs/方案设计.md](docs/方案设计.md)
- 详细技术设计: [docs/详细技术设计.md](docs/详细技术设计.md)
- 客户端实施计划: [docs/实施计划.md](docs/实施计划.md)
- 按版本执行计划: [docs/版本执行计划.md](docs/版本执行计划.md)
- 开发环境建议: [docs/开发环境建议.md](docs/开发环境建议.md)
- 桌面端工作区说明: [apps/desktop/README.md](apps/desktop/README.md)

## 启动方式

```bash
cd apps/desktop
npm install
npm run tauri dev
```

## 推荐使用流程

1. 解锁保险库
2. 创建账户
3. 创建凭证
4. 创建仓库并填写真实本地 Git 仓库路径
5. 生成日报
6. 配置 LLM 提供方
7. 测试连接
8. 保存并激活提供方
9. 生成 AI summary

## 推荐 IDE

如果只选一个，我建议你用 `Visual Studio Code`。

原因：

- 对 `Tauri + Rust + React` 组合支持最好
- Linux 和 Windows 体验一致
- 插件成熟
- 更适合当前这种多技术栈、快速演进的项目

详细建议见 [docs/开发环境建议.md](docs/开发环境建议.md)。

## 开源协议

本项目当前使用 [MIT License](LICENSE)。

## 当前边界

当前版本更适合：

- 个人开发者
- 以本地 Git 仓库为主的日报生成
- API 形式接入外部 LLM

后续增强方向见 [docs/版本执行计划.md](docs/版本执行计划.md)。
