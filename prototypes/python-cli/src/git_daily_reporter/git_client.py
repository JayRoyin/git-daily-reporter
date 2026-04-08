from __future__ import annotations

import subprocess
from pathlib import Path


class GitCommandError(RuntimeError):
    """Raised when a Git command fails."""


def run_git(repo_path: Path, args: list[str]) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=repo_path,
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise GitCommandError(completed.stderr.strip() or "git command failed")
    return completed.stdout

