from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path


@dataclass(frozen=True)
class RepoConfig:
    name: str
    path: Path
    branch: str
    template: Path
    output_dir: Path


@dataclass(frozen=True)
class AppConfig:
    timezone: str
    repos: list[RepoConfig]


@dataclass(frozen=True)
class CommitInfo:
    commit_hash: str
    author: str
    committed_at: str
    subject: str


@dataclass(frozen=True)
class FileStat:
    path: str
    additions: int
    deletions: int


@dataclass(frozen=True)
class RepoActivity:
    repo_name: str
    repo_path: Path
    branch: str
    target_date: date
    commits: list[CommitInfo]
    file_stats: list[FileStat]

