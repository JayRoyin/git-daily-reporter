import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./features/workbench/DashboardPage", () => ({
  DashboardPage: () => <div>仪表盘内容</div>,
}));

vi.mock("./features/workbench/AccountsPage", () => ({
  AccountsPage: () => <div>账户页内容</div>,
}));

vi.mock("./features/workbench/CredentialsPage", () => ({
  CredentialsPage: () => <div>凭证页内容</div>,
}));

vi.mock("./features/workbench/RepositoriesPage", () => ({
  RepositoriesPage: () => <div>仓库页内容</div>,
}));

vi.mock("./features/workbench/ReportsPage", () => ({
  ReportsPage: () => <div>报告页内容</div>,
}));

vi.mock("./features/forms/FormsWorkspace", () => ({
  useDesktopWorkspace: () => ({
    accounts: [],
    credentials: [],
    repositories: [],
    savedState: "",
    refreshData: vi.fn(),
    handleSaveAccount: vi.fn().mockResolvedValue(undefined),
    accountOptions: [],
    credentialOptions: [],
  }),
}));

vi.mock("./features/about/AboutPage", () => ({
  AboutPage: () => <div>关于页内容</div>,
}));

import App from "./App";

describe("App shell", () => {
  it("defaults to Chinese and renders the workbench without phase milestone copy", async () => {
    render(<App />);

    expect(screen.getByText("Git Daily Reporter")).toBeInTheDocument();
    expect(screen.getByText("开发者日报工作台")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "仪表盘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "账户管理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "凭证管理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "仓库管理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "报告中心" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "关于" })).toBeInTheDocument();

    expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
    expect(screen.queryByText("Next Phase")).not.toBeInTheDocument();
    expect(screen.queryByText("V0.3")).not.toBeInTheDocument();
    expect(screen.queryByText("V0.4")).not.toBeInTheDocument();
    expect(screen.queryByText("Workspace Setup")).not.toBeInTheDocument();
  });

  it("switches pages from the left navigation", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "关于" }));
    expect(screen.getByText("关于页内容")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "报告中心" }));
    expect(screen.getByText("报告页内容")).toBeInTheDocument();
  });
});
