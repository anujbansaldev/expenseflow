# Development Commands

Use pnpm.

The implementation should expose scripts equivalent to:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm start
```

Useful quality gate:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Do not run destructive database commands against production.

For scripts that seed/reset data, require:
- explicit environment guard
- explicit target database
- safe refusal in production
