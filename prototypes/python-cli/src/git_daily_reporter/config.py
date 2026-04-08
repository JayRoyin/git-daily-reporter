from __future__ import annotations

from pathlib import Path

import yaml

from git_daily_reporter.models import AppConfig, RepoConfig


def _resolve_path(config_dir: Path, raw_path: str) -> Path:
    path = Path(raw_path)
    if path.is_absolute():
        return path.resolve()
    return (config_dir / path).resolve()


def load_app_config(config_path: Path | str) -> AppConfig:
    resolved_config_path = Path(config_path).resolve()
    config_dir = resolved_config_path.parent
    data = yaml.safe_load(resolved_config_path.read_text(encoding="utf-8")) or {}

    timezone = data.get("timezone", "UTC")
    repos_data = data.get("repos", [])

    repos: list[RepoConfig] = []
    for item in repos_data:
        repos.append(
            RepoConfig(
                name=item["name"],
                path=_resolve_path(config_dir, item["path"]),
                branch=item.get("branch", "HEAD"),
                template=_resolve_path(config_dir, item["template"]),
                output_dir=_resolve_path(config_dir, item["output_dir"]),
            )
        )

    return AppConfig(timezone=timezone, repos=repos)


def get_repo_config(config: AppConfig, repo_name: str) -> RepoConfig:
    for repo in config.repos:
        if repo.name == repo_name:
            return repo
    raise KeyError(f"Unknown repo: {repo_name}")

