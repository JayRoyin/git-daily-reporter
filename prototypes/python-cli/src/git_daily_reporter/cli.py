from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from git_daily_reporter.collector import collect_repo_activity
from git_daily_reporter.config import get_repo_config, load_app_config
from git_daily_reporter.reporting import build_report_context
from git_daily_reporter.template_engine import render_template_file


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="git-daily-reporter")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate-config")
    validate_parser.add_argument("--config", required=True)

    generate_parser = subparsers.add_parser("generate")
    generate_parser.add_argument("--config", required=True)
    generate_parser.add_argument("--repo", required=True)
    generate_parser.add_argument("--date", required=True)
    generate_parser.add_argument(
        "--tomorrow-item",
        action="append",
        default=[],
        help="Add an item to tomorrow's plan.",
    )

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "validate-config":
        config = load_app_config(args.config)
        for repo in config.repos:
            _validate_repo(repo.path, repo.template)
        print(f"Config is valid: {len(config.repos)} repo(s)")
        return 0

    if args.command == "generate":
        config = load_app_config(args.config)
        repo = get_repo_config(config, args.repo)
        _validate_repo(repo.path, repo.template)

        target_date = date.fromisoformat(args.date)
        activity = collect_repo_activity(
            repo_name=repo.name,
            repo_path=repo.path,
            branch=repo.branch,
            target_date=target_date,
        )
        context = build_report_context(activity, tomorrow_items=args.tomorrow_item)
        rendered = render_template_file(repo.template, context)

        repo.output_dir.mkdir(parents=True, exist_ok=True)
        output_path = repo.output_dir / f"{repo.name}-{target_date.isoformat()}.md"
        output_path.write_text(rendered, encoding="utf-8")
        print(output_path)
        return 0

    parser.error(f"Unsupported command: {args.command}")
    return 2


def main_entry() -> None:
    raise SystemExit(main())


def _validate_repo(repo_path: Path, template_path: Path) -> None:
    if not repo_path.exists():
        raise FileNotFoundError(f"Repo path does not exist: {repo_path}")
    if not template_path.exists():
        raise FileNotFoundError(f"Template path does not exist: {template_path}")
