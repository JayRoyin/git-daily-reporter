from __future__ import annotations

from datetime import date
from pathlib import Path

from git_daily_reporter.git_client import run_git
from git_daily_reporter.models import CommitInfo, FileStat, RepoActivity


def _date_bounds(target_date: date) -> tuple[str, str]:
    start = f"{target_date.isoformat()} 00:00:00"
    end = f"{target_date.isoformat()} 23:59:59"
    return start, end


def collect_repo_activity(
    repo_name: str,
    repo_path: Path,
    branch: str,
    target_date: date,
) -> RepoActivity:
    since, until = _date_bounds(target_date)

    commit_output = run_git(
        repo_path,
        [
            "log",
            branch,
            "--since",
            since,
            "--until",
            until,
            "--date=iso-strict",
            "--pretty=format:%H%x1f%an%x1f%ad%x1f%s",
        ],
    )
    commits = _parse_commits(commit_output)

    numstat_output = run_git(
        repo_path,
        [
            "log",
            branch,
            "--since",
            since,
            "--until",
            until,
            "--numstat",
            "--format=",
        ],
    )
    file_stats = _parse_file_stats(numstat_output)

    return RepoActivity(
        repo_name=repo_name,
        repo_path=repo_path,
        branch=branch,
        target_date=target_date,
        commits=commits,
        file_stats=file_stats,
    )


def _parse_commits(output: str) -> list[CommitInfo]:
    commits: list[CommitInfo] = []
    for line in output.splitlines():
        if not line.strip():
            continue
        commit_hash, author, committed_at, subject = line.split("\x1f", maxsplit=3)
        commits.append(
            CommitInfo(
                commit_hash=commit_hash,
                author=author,
                committed_at=committed_at,
                subject=subject,
            )
        )
    return commits


def _parse_file_stats(output: str) -> list[FileStat]:
    aggregated: dict[str, FileStat] = {}
    for line in output.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        additions_raw, deletions_raw, path = parts
        additions = 0 if additions_raw == "-" else int(additions_raw)
        deletions = 0 if deletions_raw == "-" else int(deletions_raw)

        existing = aggregated.get(path)
        if existing is None:
            aggregated[path] = FileStat(path=path, additions=additions, deletions=deletions)
            continue

        aggregated[path] = FileStat(
            path=path,
            additions=existing.additions + additions,
            deletions=existing.deletions + deletions,
        )

    return sorted(
        aggregated.values(),
        key=lambda item: (-(item.additions + item.deletions), item.path),
    )

