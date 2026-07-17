# Contributing to servicenow-app-template

## Adding or Removing Template Files

When you add or remove a file that should be synced to downstream repos:

1. Update `.templatesyncignore` — add a `:!path/to/file` entry (or remove one)
2. Verify — the whitelist check in CI will catch missing entries

## Template Sync

Downstream repos receive updates weekly via the `sync-template.yml` workflow.
Files **not** listed in `.templatesyncignore` are user-owned and never overwritten.

## Development

```bash
pnpm install
pnpm run check   # lint + typecheck + test
pnpm run build   # ServiceNow SDK build
```

## Commit Format

```
<type>: <description>
```

Valid types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`
