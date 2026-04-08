from datetime import date
from pathlib import Path

from git_daily_reporter.models import CommitInfo, FileStat, RepoActivity
from git_daily_reporter.reporting import build_report_context
from git_daily_reporter.template_engine import render_template_file


def test_render_template_file_builds_markdown_report(tmp_path: Path) -> None:
    template_path = tmp_path / "daily.md.j2"
    template_path.write_text(
        "\n".join(
            [
                "# {{ report_date }}",
                "{% for item in done_items %}- {{ item }}{% endfor %}",
                "{% for item in tomorrow_items %}- {{ item }}{% endfor %}",
            ]
        ),
        encoding="utf-8",
    )

    activity = RepoActivity(
        repo_name="demo",
        repo_path=tmp_path,
        branch="HEAD",
        target_date=date(2026, 4, 8),
        commits=[
            CommitInfo(
                commit_hash="abc123",
                author="tester",
                committed_at="2026-04-08T10:00:00+08:00",
                subject="完成配置解析",
            )
        ],
        file_stats=[FileStat(path="src/app.py", additions=10, deletions=2)],
    )

    context = build_report_context(activity, tomorrow_items=["补齐 git fetch"])
    rendered = render_template_file(template_path, context)

    assert "# 2026-04-08" in rendered
    assert "- 完成配置解析" in rendered
    assert "- 补齐 git fetch" in rendered
