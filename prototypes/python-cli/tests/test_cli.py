from pathlib import Path

from git_daily_reporter.cli import main


def test_validate_config_command_returns_zero(tmp_path: Path, capsys) -> None:
    template_dir = tmp_path / "templates"
    template_dir.mkdir()
    (template_dir / "daily.md.j2").write_text("ok", encoding="utf-8")

    repo_dir = tmp_path / "repo"
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

    exit_code = main(["validate-config", "--config", str(config_path)])
    captured = capsys.readouterr()

    assert exit_code == 0
    assert "Config is valid" in captured.out
