# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**QuestMaster** — An interactive adventure platform where admins create immersive quests with AI-powered characters, professional maps, and real-time voice conversations. Users explore locations, talk to AI characters, solve challenges, and compete on leaderboards.

## Repository Structure

```
quest-app/
├── infrastructure/     # AWS CDK (Python) — Pipelines, stacks
├── backend/            # GraphQL schema, Lambda resolvers (Python 3.11), tests
├── frontend/           # Next.js 15, React 19, Tailwind v4, TypeScript
└── mobile/             # Expo React Native
```

## Common Commands

### Frontend

| Task | Command | Directory |
|------|---------|-----------|
| Dev server | `npm run dev` | `frontend/` |
| Build (static export) | `npm run build` | `frontend/` |
| Lint | `npm run lint` | `frontend/` |
| Tests | `npm test` | `frontend/` |
| Tests with UI | `npm run test:ui` | `frontend/` |

### Backend

| Task | Command | Directory |
|------|---------|-----------|
| Unit tests | `python3 -m pytest tests/ -v` | `backend/` |
| E2E tests | `python3 -m pytest tests/ -v -m e2e` | `backend/` |
| Seed quests | `python scripts/seed_quests.py [env]` | `backend/` |
| Setup admin | `python scripts/setup_admin.py <email> <password> [env]` | `backend/` |

### Infrastructure

| Task | Command | Directory |
|------|---------|-----------|
| Install CDK deps | `pip install -r requirements.txt` | `infrastructure/` |
| Synth stacks | `npx cdk synth` | `infrastructure/` |

### Mobile

| Task | Command | Directory |
|------|---------|-----------|
| Install deps | `npm ci` | `mobile/` |
| Start (Expo) | `npm start` | `mobile/` |

## Architecture

```
Client (Next.js 15 / React Native Expo)
  → AppSync GraphQL API (Cognito auth)
    → Lambda resolvers (Python 3.11)
      → DynamoDB tables (6)
  → OpenAI Realtime API (voice with AI characters)
  → Bedrock (challenge verification & analysis)
```

**Infrastructure**: AWS CDK (Python) with CDK Pipelines. Region: eu-west-1. Account: 890742600627.

### DynamoDB Tables (6)
- **users** — userId (PK), email (GSI)
- **quests** — id (PK), embedded stages with characters/locations/challenges
- **progress** — id (PK), userId+questId (GSI)
- **conversations** — id (PK), userId+startedAt (GSI)
- **scores** — id (PK), userId+completedAt (GSI)
- **achievements** — id (PK), userId+earnedAt (GSI)

### Key Patterns
- Cognito pre-signup Lambda auto-confirms users
- Lambda resolvers: individual Python files in `backend/lambdas/resolvers/`
- GraphQL schema: `backend/schema/schema.graphql`
- CDK entry: `infrastructure/app.py`, stacks in `infrastructure/stacks/`
- Frontend: Next.js App Router with route groups `(auth)` and `(app)`
- Auth: `auth_helpers.py` — check_user_access + check_admin_access
- Validation: `validation.py` — shared input validation
- Voice: OpenAI Realtime API with server-side token generation
- Analysis: Bedrock (Claude → Nova fallback) for challenge evaluation
- Maps: Mapbox GL JS with react-map-gl
- Admin: role-based access via Cognito groups

### Security
- WAFv2 rate limiting (1000 req/5min/IP) + AWS Common Rule Set
- CloudFront security headers (HSTS, CSP, X-Frame-Options)
- Least-privilege Lambda IAM per resolver
- Input validation on both client and server
