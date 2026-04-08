from __future__ import annotations

from git_daily_reporter.models import RepoActivity


def build_report_context(
    activity: RepoActivity,
    tomorrow_items: list[str] | None = None,
) -> dict[str, object]:
    done_items = [commit.subject for commit in activity.commits]
    total_additions = sum(item.additions for item in activity.file_stats)
    total_deletions = sum(item.deletions for item in activity.file_stats)

    return {
        "repo_name": activity.repo_name,
        "repo_path": str(activity.repo_path),
        "branch": activity.branch,
        "report_date": activity.target_date.isoformat(),
        "commit_count": len(activity.commits),
        "changed_file_count": len(activity.file_stats),
        "total_additions": total_additions,
        "total_deletions": total_deletions,
        "done_items": done_items,
        "changed_files": activity.file_stats,
        "tomorrow_items": tomorrow_items or [],
    }

