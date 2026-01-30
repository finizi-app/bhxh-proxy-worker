# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloudflare Worker that proxies the Vietnam Social Insurance (BHXH) API. Implements autonomous login with CAPTCHA solving via AI, session caching in KV, and employee data retrieval.

**API Docs**: `api-docs/headless_login_docs.md` and `api-docs/headless_employee_api_docs.md`

## Commands

```bash
# Development
npm run dev              # Start local dev server (wrangler dev)
npm run deploy           # Deploy to Cloudflare
npm run cf-typegen       # Generate TypeScript types for bindings

# Secrets (required for production)
wrangler secret put BHXH_USERNAME
wrangler secret put BHXH_PASSWORD
wrangler secret put BHXH_ENCRYPTION_KEY
wrangler secret put AI_CAPTCHA_ENDPOINT
wrangler secret put AI_CAPTCHA_API_KEY
```

## Architecture

```
src/
├── index.ts         # Main entry, route handling, CORS
├── auth.ts          # Session management, KV caching, AI captcha solver
├── bhxh-client.ts   # API client (login, captcha, employee fetch)
└── crypto.ts        # AES encryption for X-CLIENT header
```

**Request Flow**: `/employees` → Check KV cache → If expired, auto-login (Client ID → X-CLIENT → Captcha → AI Solve → Token) → Cache in KV → Call API 067

**Key Configuration** (`wrangler.toml`):
- `BHXH_SESSION` KV namespace (1-hour TTL)
- `BHXH_BASE_URL`: `https://dichvucong.baohiemxahoi.gov.vn`
- `USE_PROXY`: Routes requests through `EXTERNAL_PROXY_URL` if "true"

## Development Rules

- Primary workflow: `./.claude/rules/primary-workflow.md`
- Development rules: `./.claude/rules/development-rules.md`
- Orchestration protocols: `./.claude/rules/orchestration-protocol.md`
- Documentation management: `./.claude/rules/documentation-management.md`

**IMPORTANT:** Follow `./.claude/rules/development-rules.md` - YAGNI, KISS, DRY principles.

## Privacy Block Hook

When blocked by privacy hook, use `AskUserQuestion` to get user approval before accessing sensitive files.

## Python Scripts

Use `.claude/skills/.venv/bin/python3` for skill scripts.

## File Organization

- Code files: Use kebab-case, keep under 200 lines
- Plans: `./plans/{timestamp}-{slug}/` directory
- Reports: `./plans/reports/` directory
- Docs: `./docs/` directory
