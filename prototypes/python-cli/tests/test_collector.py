import subprocess
from datetime import date
from pathlib import Path

from git_daily_reporter.collector import collect_repo_activity


def run_git(repo: Path, *args: str, env: dict[str, str] | None = None) -> None:
    merged_env = None
    if env is not None:
        merged_env = dict(**env)
    subprocess.run(
        ["git", *args],
        cwd=repo,
        check=True,
        text=True,
        env=merged_env,
    )


def test_collect_repo_activity_returns_commits_and_file_stats(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()

    run_git(repo, "init")
    run_git(repo, "config", "user.name", "Tester")
    run_git(repo, "config", "user.email", "tester@example.com")

    tracked_file = repo / "notes.txt"
    tracked_file.write_text("hello\nworld\n", encoding="utf-8")

    commit_env = {
        "PATH": __import__("os").environ["PATH"],
        "HOME": __import__("os").environ.get("HOME", ""),
        "GIT_AUTHOR_DATE": "2026-04-08T10:30:00+08:00",
        "GIT_COMMITTER_DATE": "2026-04-08T10:30:00+08:00",
    }
    run_git(repo, "add", "notes.txt")
    run_git(repo, "commit", "-m", "新增日报采集样例", env=commit_env)

    activity = collect_repo_activity(
        repo_name="demo",
        repo_path=repo,
        branch="HEAD",
        target_date=date(2026, 4, 8),
    )

    assert len(activity.commits) == 1
    assert activity.commits[0].subject == "新增日报采集样例"
    assert len(activity.file_stats) == 1
    assert activity.file_stats[0].path == "notes.txt"
    assert activity.file_stats[0].additions == 2
