# Contributing

## Working Rules

- Keep the desktop product as the primary target.
- Treat the Python CLI as an archived prototype, not the future architecture.
- Do not store secrets in plaintext.
- Do not log tokens, passphrases, or private keys.
- Keep docs aligned with the current architecture before implementing new phases.

## Branching

- Use short-lived feature branches.
- Avoid direct work on `main`.
- Keep commits scoped and readable.

## Project Areas

- `apps/desktop/`: future Tauri desktop app
- `docs/`: product, architecture, and execution docs
- `prototypes/python-cli/`: archived prototype for reference

## Before Opening a PR

- Re-read the relevant version plan in `docs/版本执行计划.md`
- Verify file references in docs still match the repository
- Run the relevant test/build commands for the part you changed
