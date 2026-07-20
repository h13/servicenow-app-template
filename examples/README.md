# Examples

Working, CI-verified sample code for the patterns this template recommends.
Everything in this directory is type-checked, linted, and unit-tested by CI,
but it lives **outside `src/`** so it is never built into or deployed with
your app.

## Layout

```
examples/
├── fluent/
│   └── business-rules/
│       └── set-priority.now.ts    # Fluent wiring: declares the business rule
└── server/
    ├── business-rules/
    │   ├── set-priority.ts        # Thin Glide-facing wrapper
    │   └── set-priority.test.ts
    └── utils/
        ├── resolve-priority.ts    # Pure logic — no Glide APIs
        └── resolve-priority.test.ts
```

## The pattern

1. **Pure logic in `utils/`** — no Glide imports, fully unit-testable with
   Vitest, no instance required.
2. **Thin wrappers in `business-rules/`** — translate GlideRecord values to
   and from the pure functions. Tests stub the record with a plain object.
3. **Fluent wiring in `fluent/`** — declares the platform record
   (`BusinessRule`, `ClientScript`, …) and points its `script` at the wrapper.
4. **Tests live next to the code** — the SDK excludes `*.test.ts` from server
   module builds by default, so co-located tests never reach the instance.

## Adopting an example

```bash
# After `init` has scaffolded your project:
cp -R examples/fluent/business-rules src/fluent/
cp -R examples/server/business-rules examples/server/utils src/server/

# Point the rule at a real table in your scope, then:
pnpm run build        # registers 'set-priority' in src/fluent/generated/keys.ts
git add -A            # commit code AND the regenerated keys.ts
```

Don't need the examples? Delete this directory freely — it is synced from the
template, so removing it locally only means future example updates won't
appear in sync PRs.
