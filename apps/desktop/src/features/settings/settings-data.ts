export interface SettingsSection {
  id: "accounts" | "credentials" | "repositories" | "schedules" | "templates";
  title: string;
  description: string;
  status: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "accounts",
    title: "Accounts",
    description: "Manage Git identities, platform metadata, and default auth.",
    status: "Not configured",
  },
  {
    id: "credentials",
    title: "Credentials",
    description: "Store SSH keys and GitHub personal access tokens securely.",
    status: "Security phase pending",
  },
  {
    id: "repositories",
    title: "Repositories",
    description: "Bind remotes to accounts, credentials, and author filters.",
    status: "No repositories yet",
  },
  {
    id: "schedules",
    title: "Schedules",
    description: "Define trigger times and reporting window strategies.",
    status: "Automation not installed",
  },
  {
    id: "templates",
    title: "Templates",
    description: "Select report formats and preview custom summary layouts.",
    status: "Default markdown only",
  },
];
