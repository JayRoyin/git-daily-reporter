from pathlib import Path

from git_daily_reporter.config import load_app_config


def test_load_app_config_resolves_relative_paths(tmp_path: Path) -> None:
    template_dir = tmp_path / "templates"
    template_dir.mkdir()
    (template_dir / "daily.md.j2").write_text("hello", encoding="utf-8")

    output_dir = tmp_path / "reports"
    repo_dir = tmp_path / "demo_repo"
    repo_dir.mkdir()

    config_path = tmp_path / "config.yaml"
    config_path.write_text(
        "\n".join(
            [
                "timezone: Asia/Shanghai",
                "repos:",
                "  - name: demo",
                f"    path: {repo_dir}",
                "    branch: HEAD",
                "    template: templates/daily.md.j2",
                "    output_dir: reports",
            ]
        ),
        encoding="utf-8",
    )

    config = load_app_config(config_path)

    assert config.timezone == "Asia/Shanghai"
    assert len(config.repos) == 1
    repo = config.repos[0]
    assert repo.name == "demo"
    assert repo.path == repo_dir.resolve()
    assert repo.template == (template_dir / "daily.md.j2").resolve()
    assert repo.output_dir == output_dir.resolve()
