# ServiceNow App Template

[![CI](https://github.com/h13/servicenow-app-template/actions/workflows/ci.yml/badge.svg)](https://github.com/h13/servicenow-app-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/h13/servicenow-app-template/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![ServiceNow SDK](https://img.shields.io/badge/ServiceNow%20SDK-Fluent-4285F4.svg)](https://servicenow.github.io/sdk/)

[日本語](README.ja.md)

**Source-driven ServiceNow app development with modern tooling.**

Create a repo from this template, authenticate to your instance, and you get a fully configured development environment — linting, type checking, testing, build validation on PRs, and automatic deployment on merge. No manual pipeline setup required.

**[→ Quick Start](#quick-start)** · [What's Included](#whats-included) · [Deployment Strategy](#deployment-strategy) · [FAQ](#faq)

## The Problem

ServiceNow apps built in the browser lack what developers take for granted everywhere else:

- **No version control** — changes are tracked in update sets, not Git commits
- **No code review** — no pull requests, no peer review before production
- **No automated testing** — manual verification on the instance
- **No reproducible builds** — "it works on my instance" is the only guarantee
- **No collaboration tooling** — no branch strategy, no CI/CD, no dependency management

When you have one app, this is manageable. When you have five, it's a maintenance burden. When someone makes a bad change to production, there's no easy rollback.

## The Solution

This template brings ServiceNow app development into the same workflow you use for everything else:

- **Git-based source control** — every change is a commit, every feature is a branch
- **Pull request workflow** — code review before anything reaches the instance
- **CI/CD pipeline** — automated build validation + deployment
- **Modern tooling** — TypeScript, ESLint, Prettier, Vitest

The [ServiceNow SDK](https://servicenow.github.io/sdk/) makes this possible by letting you author app metadata as code (Fluent DSL) and server-side scripts as TypeScript, then compile and deploy via CLI.

## What's Included

| Category      | Tools                                           |
| ------------- | ----------------------------------------------- |
| Language      | TypeScript (strict mode)                        |
| SDK           | ServiceNow SDK (Fluent DSL + server scripts)    |
| Linting       | ESLint + Prettier                               |
| Testing       | Vitest                                          |
| Type checking | `tsc --noEmit`                                  |
| CI/CD         | GitHub Actions (build validation + auto-deploy) |
| Dependencies  | Renovate (auto-update via h13/renovate-config)  |
| Template sync | Weekly upstream sync (tooling updates auto-PR)  |

## Quick Start

### 1. Create a repo from this template

Click **"Use this template"** on GitHub.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure your app

Edit `now.config.json`:

```json
{
  "scope": "x_yourcompany_yourapp",
  "name": "Your App Name",
  "tsconfigPath": "./src/server/tsconfig.json"
}
```

### 4. Authenticate

```bash
npx @servicenow/sdk auth --add https://<your-instance>.service-now.com
```

### 5. Pull an existing app

```bash
# Get sys_id from sys_app.list on your instance
npx @servicenow/sdk init --from <sys_id>

# Convert XML metadata to Fluent TypeScript
npx @servicenow/sdk transform --from .

# Download platform type definitions
npx @servicenow/sdk dependencies

# Verify
pnpm run build
```

### 6. Configure CI/CD secrets

Create a `dev` environment in repo Settings → Environments with:

| Secret                | Value                    |
| --------------------- | ------------------------ |
| `SN_SDK_INSTANCE_URL` | Your dev instance URL    |
| `SN_SDK_USER`         | Service account username |
| `SN_SDK_USER_PWD`     | Service account password |

## Development Workflow

```bash
# Edit Fluent code or server scripts
vim src/fluent/business-rules/my-rule.now.ts

# Run all checks
pnpm run check          # lint + typecheck + test

# Build
pnpm run build

# Test on instance (optional, local iteration)
pnpm run install:instance

# Commit, push, create PR
git add -A && git commit -m "feat: add approval rule"
git push -u origin feature/approval-rule
```

### The Inner Loop

```
Edit → check → build → install:instance → verify on instance → repeat
```

Local `install:instance` is for rapid iteration. CI handles the canonical deployment.

## Deployment Strategy

| Environment   | Method                     | Trigger              |
| ------------- | -------------------------- | -------------------- |
| Dev instance  | `now-sdk install` via CI   | Merge to `main`      |
| Prod instance | App Repo (Install/Upgrade) | Manual after Publish |

### Why not CI-deploy to production?

ServiceNow's platform expects production deployments to go through the [App Repo](https://www.servicenow.com/docs/r/application-development/share-an-application/application-repository.html) — this gives you:

- Platform-native version management
- Rollback to previous versions
- Change Management integration
- Dependency validation

CI deploys to dev. Production promotion is a deliberate, auditable act.

### Release Flow

```
feature branch → PR (CI validates) → merge to main
                                        ↓
                              CI: build + install → dev instance
                                        ↓
                              Verify on dev instance
                                        ↓
                              Publish → App Repo
                                        ↓
                              Prod: Install/Upgrade
```

## CI/CD Pipeline

```
Push / PR  →  Shared CI (ci-node.yml)  →  Frozen Keys Check
               ├── Lint                      └── now-sdk build --frozenKeys
               ├── Typecheck
               ├── Test
               └── Build

Merge to main  →  Deploy
                    └── now-sdk build + install → dev instance
```

| Trigger         | Pipeline         | Behavior                                     |
| --------------- | ---------------- | -------------------------------------------- |
| Any push / PR   | CI + frozen keys | lint → typecheck → test → build → frozenKeys |
| Merge to `main` | Deploy           | build → install to dev instance              |

### Why `--frozenKeys`?

`keys.ts` maps Fluent identifiers (`Now.ID['my-rule']`) to ServiceNow `sys_id` values. If a developer adds a new identifier without committing the regenerated `keys.ts`:

- Each machine generates a different `sys_id` for the same logical record
- Updates become inserts — duplicate records on the instance
- Subsequent merges propagate wrong IDs

`--frozenKeys` catches this in CI before merge.

## Commands

| Command                     | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `pnpm run check`            | Lint + typecheck + test (run before committing) |
| `pnpm run build`            | ServiceNow SDK build                            |
| `pnpm run build:ci`         | Build with `--frozenKeys` validation            |
| `pnpm run lint`             | ESLint with auto-fix                            |
| `pnpm run typecheck`        | TypeScript type checking                        |
| `pnpm run test`             | Run tests with Vitest                           |
| `pnpm run format`           | Format with Prettier                            |
| `pnpm run install:instance` | Deploy to authenticated instance                |
| `pnpm run deploy`           | Build + install (one command)                   |
| `pnpm run transform`        | Convert XML metadata to Fluent                  |
| `pnpm run download`         | Sync metadata from instance                     |
| `pnpm run dependencies`     | Download platform type definitions              |

## Project Structure

```
your-app/
├── src/
│   ├── fluent/
│   │   ├── index.now.ts           # Fluent entry point
│   │   ├── business-rules/        # Business rules (.now.ts)
│   │   ├── client-scripts/        # Client scripts (.now.ts)
│   │   └── generated/
│   │       └── keys.ts            # Record ID mapping (must be committed)
│   └── server/
│       ├── tsconfig.json          # Server-side TypeScript config
│       └── scripts/               # Server-side scripts
├── test/                          # Vitest tests
├── metadata/                      # XML metadata (Fluent-unsupported)
├── .github/workflows/
│   ├── ci.yml                     # CI: shared workflow + frozenKeys
│   ├── deploy.yml                 # CD: deploy on merge to main
│   └── sync-template.yml         # Weekly template sync
├── now.config.json                # App scope & metadata
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── renovate.json
```

## Keeping Repos in Sync

### Template Sync

The `sync-template.yml` workflow checks for upstream template updates weekly. When updates are found, a PR with the `template-sync` label is created automatically.

`.templatesyncignore` uses a whitelist format — only listed files are synced. Your source code, tests, `now.config.json`, and `README.md` are never overwritten.

### Renovate

Configured via [`h13/renovate-config:node`](https://github.com/h13/renovate-config):

- Minor/patch: automerged
- Major: PR for manual review (labeled `breaking`)
- DevDependencies: grouped and automerged
- 7-day stability buffer
- Runs weekly on Sunday

## FAQ

### Can I use this for a new app (greenfield)?

Yes. Skip step 5 (pull existing app) and use `npx @servicenow/sdk init` with `--appName`, `--scopeName`, and `--template` flags to scaffold from scratch.

### What if my app has artifacts that Fluent doesn't support yet?

They remain as XML in `metadata/` and deploy as-is alongside Fluent artifacts. As Fluent coverage expands, you can incrementally convert them with `transform`.

### Do I need the ServiceNow IDE or VS Code extension?

No. The SDK CLI is all you need. Use any editor you like.

### Can multiple developers work on the same app?

Yes — that's the point. Branch, PR, merge. `keys.ts` ensures everyone's `sys_id` mappings stay consistent.

## License

[MIT](LICENSE)
