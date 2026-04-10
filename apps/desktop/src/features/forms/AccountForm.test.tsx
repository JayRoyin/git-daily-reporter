import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountForm } from "./AccountForm";

vi.mock("../accounts/api", () => ({
  PLATFORM_OPTIONS: [
    { id: "github", label: "GitHub", baseUrl: "https://github.com" },
    { id: "gitlab", label: "GitLab", baseUrl: "https://gitlab.com" },
    { id: "gitea", label: "Gitea", baseUrl: "https://gitea.com" },
    { id: "gitee", label: "Gitee", baseUrl: "https://gitee.com" },
    { id: "custom", label: "Custom" },
  ],
  readGitIdentity: vi.fn().mockResolvedValue({
    gitUsername: "qstdc",
    gitEmail: "qstdc@example.com",
  }),
  verifyAccount: vi.fn().mockResolvedValue({
    status: "verified",
    message: "ok",
  }),
}));

describe("AccountForm", () => {
  it("hides built-in platform URLs and only shows address input for custom platform", async () => {
    const user = userEvent.setup();

    render(<AccountForm language="zh" />);

    expect(screen.queryByLabelText("内置测试地址")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("平台地址")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("平台"), "custom");

    expect(screen.getByLabelText("平台地址")).toBeInTheDocument();
  });
});
