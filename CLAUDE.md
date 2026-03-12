# da-admin — Cloudflare Worker

DA (Document Authoring) admin Worker. Handles admin operations for the DA content authoring platform.

## Rules

@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/cloudflare-workers-conventions.md
@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/cloudflare-workers-deployment.md
@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/development-standards-shared.md

## Stack

- Runtime: Cloudflare Workers
- Config: `wrangler.toml`
- Entry: `src/`

## Branch Strategy

- `main` — upstream mirror. Do not commit here.
- `main-ams` — primary working branch
