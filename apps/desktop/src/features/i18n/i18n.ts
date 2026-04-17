export type Language = "en" | "zh";

export const messages = {
  en: {
    english: "English",
    chinese: "中文",
    accountWorkspace: "Account Workspace",
    accountSummary: "Create Git identities and choose a default auth transport.",
    credentialWorkspace: "Credential Workspace",
    credentialSummary:
      "Prepare SSH keys and GitHub tokens before secure persistence wiring.",
    repositoryWorkspace: "Repository Workspace",
    repositorySummary:
      "Define remotes, branch defaults, and author filters for report generation.",
    displayName: "Display name",
    gitUsername: "Git username",
    gitEmail: "Git email",
    defaultAuth: "Default auth",
    remoteUrl: "Remote URL",
    defaultBranch: "Default branch",
    authorFilter: "Author filter",
    branchHint: "usually main or master",
    accountPlaceholder: "Personal GitHub",
    sshKey: "SSH key",
    githubToken: "GitHub token",
  },
  zh: {
    english: "English",
    chinese: "中文",
    accountWorkspace: "账户工作区",
    accountSummary: "创建 Git 身份，并选择默认认证方式。",
    credentialWorkspace: "凭证工作区",
    credentialSummary: "为 SSH 密钥和 GitHub Token 提供录入入口。",
    repositoryWorkspace: "仓库工作区",
    repositorySummary: "定义远程仓库、默认分支和作者过滤规则。",
    displayName: "显示名称",
    gitUsername: "Git 用户名",
    gitEmail: "Git 邮箱",
    defaultAuth: "默认认证",
    remoteUrl: "远程仓库地址",
    defaultBranch: "默认分支",
    authorFilter: "作者过滤",
    branchHint: "通常是 main 或 master",
    accountPlaceholder: "个人 GitHub",
    sshKey: "SSH 密钥",
    githubToken: "GitHub Token",
  },
} satisfies Record<Language, Record<string, string>>;

export type MessageKey = keyof (typeof messages)["en"];
