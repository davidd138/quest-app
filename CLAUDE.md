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
  -> AppSync GraphQL API (Cognito auth)
    -> Lambda resolvers (Python 3.11)
      -> DynamoDB tables (6)
  -> OpenAI Realtime API (voice with AI characters)
  -> Bedrock (challenge verification & analysis)
```

**Infrastructure**: AWS CDK (Python) with CDK Pipelines for CI/CD. Region: eu-west-1. Account: 890742600627. GitHub source via CodeStar Connections.

### DynamoDB Tables (6)

| Table | Partition Key | GSIs |
|-------|--------------|------|
| **users** | userId | email |
| **quests** | id | — (embedded stages with characters/locations/challenges) |
| **progress** | id | userId-questId-index |
| **conversations** | id | userId-startedAt-index |
| **scores** | id | userId-completedAt-index |
| **achievements** | id | userId-earnedAt-index |

### Lambda Resolvers (31)

All resolvers live in `backend/lambdas/resolvers/`. Each is a standalone Python file with a `handler(event, context)` function.

#### Queries (14)
| Resolver | Description |
|----------|-------------|
| `get_quest.py` | Fetch single quest by ID |
| `list_quests.py` | List quests with category/difficulty filters, pagination |
| `get_progress.py` | Get user progress for a quest |
| `list_conversations.py` | List conversations, optionally filtered by quest |
| `get_conversation.py` | Fetch single conversation by ID |
| `get_leaderboard.py` | Global leaderboard with ranking |
| `get_achievements.py` | List user achievements |
| `get_analytics.py` | User analytics (points, completion rate, play time) |
| `get_admin_analytics.py` | Platform-wide admin analytics |
| `get_realtime_token.py` | Generate OpenAI Realtime API session token |
| `list_all_users.py` | Admin: paginated user list |
| `export_user_data.py` | GDPR data export (all user data across tables) |
| `get_quest_ratings.py` | Rating stats for a quest |
| `list_pending_quests.py` | Admin: list community quests awaiting approval |
| `list_content_reports.py` | Admin: list content moderation reports |

#### Mutations (16)
| Resolver | Description |
|----------|-------------|
| `sync_user.py` | Create/update user profile from Cognito |
| `start_quest.py` | Initialize progress record for a quest |
| `update_progress.py` | Update quest progress (stage index, status) |
| `complete_stage.py` | Mark a stage complete, award points |
| `create_conversation.py` | Start a new AI character conversation |
| `update_conversation.py` | Update transcript, status, duration |
| `analyze_conversation.py` | Bedrock analysis of conversation (Claude -> Nova fallback) |
| `create_quest.py` | Admin: create a new quest |
| `update_quest.py` | Admin: update existing quest |
| `delete_quest.py` | Admin: delete a quest |
| `update_user_status.py` | Admin: change user status (active/suspended) |
| `delete_user_data.py` | GDPR: delete all user data + Cognito account |
| `rate_quest.py` | Submit quest rating and review |
| `create_community_quest.py` | User-created quest (pending approval) |
| `report_content.py` | Report inappropriate content |
| `approve_quest.py` | Admin: approve/reject community quest |

#### Shared Modules
| Module | Description |
|--------|-------------|
| `auth_helpers.py` | `check_user_access` + `check_admin_access` |
| `validation.py` | Shared input validation |
| `audit_helpers.py` | Audit logging utilities |
| `email_templates.py` | Email template generation |

### CDK Stacks (infrastructure/stacks/)

| Stack | Description |
|-------|-------------|
| `pipeline_stack.py` | CDK Pipelines CI/CD with GitHub source |
| `backend_stack.py` | Cognito, AppSync, Lambda resolvers, DynamoDB, WAF |
| `frontend_stack.py` | S3 + CloudFront static hosting, security headers |

### Frontend Pages (56 total)

#### Auth Pages (`(auth)/`)
- `/` — Landing page
- `/login` — Sign in
- `/register` — Sign up
- `/about` — About QuestMaster
- `/privacy` — Privacy policy
- `/terms` — Terms of service

#### App Pages (`(app)/`)

**Core:**
- `/dashboard` — User home with stats, active quests, recommendations
- `/quests` — Quest listing with filters and search
- `/quests/[id]` — Quest detail
- `/quests/[id]/preview` — Quest preview
- `/quests/favorites` — Favorited quests
- `/quests/map` — Map-based quest discovery
- `/quests/nearby` — Nearby quests (geolocation)
- `/discover` — Discovery feed

**Quest Play:**
- `/quest-play/[id]` — Quest play lobby
- `/quest-play/[id]/stage/[stageId]` — Active stage gameplay
- `/quest-play/[id]/chat/[stageId]` — AI character voice chat
- `/quest-play/[id]/report` — Post-quest report

**Social:**
- `/leaderboard` — Global rankings
- `/leaderboard/seasons` — Seasonal leaderboards
- `/achievements` — Achievement gallery
- `/community` — Community feed
- `/social` — Social hub
- `/clans` — Clan system
- `/multiplayer` — Multiplayer mode
- `/voice-rooms` — Voice room lobbies
- `/voice-chat/[conversationId]` — Live voice chat
- `/messages` — Messaging
- `/share/[type]/[id]` — Share content

**User:**
- `/profile` — User profile
- `/profile/data` — GDPR data management
- `/settings` — App settings (theme, notifications, language)
- `/analytics` — Personal analytics
- `/analytics/detailed` — Detailed stats
- `/stats` — Statistics dashboard
- `/history` — Quest history
- `/notifications` — Notification center

**Content:**
- `/create` — Community quest creator
- `/collections` — Quest collections
- `/events` — Seasonal events
- `/rewards` — Rewards shop
- `/feedback` — Feedback form and feature voting
- `/changelog` — Version changelog
- `/help` — Help center / FAQ

**Admin:**
- `/admin/quests` — Quest management
- `/admin/quests/new` — Create quest
- `/admin/quests/[id]/edit` — Edit quest
- `/admin/quests/visual-editor` — Drag-and-drop quest builder
- `/admin/users` — User management
- `/admin/analytics` — Platform analytics
- `/admin/moderation` — Content moderation
- `/admin/reports` — Reports dashboard
- `/admin/reports/content` — Content report detail
- `/admin/audit` — Audit logs
- `/admin/emails` — Email templates
- `/admin/webhooks` — Webhook management

### Key Frontend Components (100+)

#### UI Components (`components/ui/`)
AnimatedNumber, Avatar, Badge, Button, Card, Confetti, ConfirmDialog, DatePicker, Drawer, Dropdown, EmptyState, ErrorState, FocusTrap, GradientText, Input, KeyboardShortcutsHelp, LiveRegion, Modal, ParticleBackground, ProgressBar, ProgressIndicator, Select, Skeleton, SkipToContent, Stepper, Switch, Tabs, Toast, Tooltip

#### Quest Components (`components/quest/`)
AIQuestGenerator, AchievementBadges, AchievementUnlock, ChallengePreview, CharacterAvatar, CharacterTemplates, CollectionCard, CountdownTimer, DailyStreak, DifficultyBadge, DistanceIndicator, FavoriteButton, LivePlayerCount, OnboardingTour, PhotoMode, PointsBalance, QuestBriefing, QuestCard, QuestChallenges, QuestChat, QuestCompare, QuestDifficultyMeter, QuestFilters, QuestMinimap, QuestProgress, QuestRating, QuestRecommendations, QuestReplay, QuestReport, QuestSearch, QuestSummary, QuestTimeline, QuestTimer, RewardCard, SeasonalBanner, ShareCard, StageCard, WeatherWidget, WizardStep, XPProgressBar

#### Map Components (`components/maps/`)
Map3DToggle, MapStyleSwitcher, QuestMap, RouteLayer, StageMarker

#### Voice Components (`components/voice/`)
AudioVisualizer, CharacterPanel, EmotionIndicator, TranscriptPanel, VoiceEffects, VoiceInterface

#### Social Components (`components/social/`)
ActivityFeed, ChatBubble, ClanBadge, ClanCard, InviteLink, UserProfileCard, VoiceRoomCard

#### Analytics Components (`components/analytics/`)
CompletionFunnel, HeatmapCalendar, SkillRadar

#### Admin Components (`components/admin/`)
AdminStatsCards, CharacterBuilder, MapPicker, ModerationQueue, PlatformHealthCard, QuestEditor, QuestPerformanceTable, StageEditor, UserActivityChart

#### Layout Components (`components/layout/`)
AdminGuard, AuthGuard, AuthProvider, Breadcrumbs, CookieConsent, ErrorBoundary, Footer, LanguageSwitcher, LoadingScreen, Logo, NotificationBell, PushNotificationSetup, Sidebar, Topbar

#### Multiplayer Components (`components/multiplayer/`)
PlayerLobby, TeamProgress

### Frontend Hooks (12)
| Hook | Description |
|------|-------------|
| `useAuth` | Cognito auth state, sign in/out, current user |
| `useDebounce` | Debounced value with configurable delay |
| `useGeolocation` | Browser geolocation with caching (10min TTL) |
| `useGraphQL` | AppSync GraphQL query/mutation wrapper |
| `useInfiniteScroll` | Intersection Observer pagination |
| `useKeyboardShortcuts` | Global keyboard shortcut registration |
| `useLocalStorage` | Type-safe localStorage with cross-tab sync |
| `useMap` | Mapbox GL map instance management |
| `useNotifications` | Push notification subscription |
| `useRealtimeVoice` | OpenAI Realtime API voice session management |
| `useReducedMotion` | Respects `prefers-reduced-motion` |
| `useWeather` | Open-Meteo API weather data with caching (30min TTL) |

### Frontend Libraries (`lib/`)
| Module | Description |
|--------|-------------|
| `amplify-config.ts` | AWS Amplify client configuration |
| `animations.ts` | Framer Motion variants and transitions |
| `constants.ts` | App-wide constants |
| `geo.ts` | Haversine distance, formatting, walk time, color coding |
| `graphql/` | GraphQL query/mutation string definitions |
| `i18n.ts` | Internationalization (ES/EN) |
| `security.ts` | Input sanitization, XSS prevention |
| `seo.ts` | SEO metadata helpers |
| `theme.ts` | Dark/light/system theme provider |

## Testing

### Backend Tests (~320 tests)
Located in `backend/tests/`. Run with `python3 -m pytest tests/ -v`.

| Test File | Coverage |
|-----------|----------|
| `test_quests.py` | CRUD operations, validation, admin access |
| `test_conversations.py` | Create, update, analyze conversations |
| `test_progress.py` | Start quest, complete stage, update progress |
| `test_analytics.py` | User and admin analytics |
| `test_analyze.py` | Bedrock conversation analysis |
| `test_auth_helpers.py` | Access control, user/admin checks |
| `test_community_quest.py` | Community quest creation, approval |
| `test_e2e.py` | End-to-end integration (marked `e2e`, skipped by default) |
| `test_email_templates.py` | Email template rendering |
| `test_gdpr.py` | Data export and deletion |
| `test_integration_full_flow.py` | Full quest lifecycle |
| `test_leaderboard.py` | Ranking, scoring |
| `test_moderation.py` | Content reports, moderation actions |
| `test_ratings.py` | Quest rating and review |
| `test_realtime_token.py` | OpenAI token generation |
| `test_security.py` | Input validation, injection prevention |
| `test_validation.py` | Shared validation module |

### Frontend Tests (62 test files)
Located in `frontend/src/__tests__/`. Run with `npm test`.

- **24 component tests** — UI, quest, map, voice components
- **5 hook tests** — useAuth, useDebounce, useGraphQL, useLocalStorage, useRealtimeVoice
- **3 lib tests** — geo, i18n, security
- **10+ page tests** — dashboard, quests, leaderboard, community, settings, etc.
- Uses Vitest + @testing-library/react
- Framer Motion mocked via Proxy pattern
- Setup file: `frontend/src/__tests__/setup.ts`

## Security

- **WAFv2**: Rate limiting (1000 req/5min/IP) + AWS Common Rule Set
- **CloudFront**: Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- **Cognito**: User pool with pre-signup auto-confirmation trigger
- **IAM**: Least-privilege Lambda execution roles per resolver
- **Input validation**: Both client-side (`lib/security.ts`) and server-side (`validation.py`)
- **XSS prevention**: Input sanitization in security lib
- **Cookie consent**: GDPR-compliant cookie consent banner

## GDPR / LOPD Compliance

- **Data export** (`exportMyData`): Full user data export across all 6 tables, Decimal-safe JSON serialization, audit-logged
- **Account deletion** (`deleteMyAccount`): Removes all data from DynamoDB + Cognito account, with 30-day grace period
- **Privacy page**: `/privacy` with detailed data processing information
- **Data management page**: `/profile/data` for users to manage their personal data
- **Cookie consent**: Configurable consent banner (`CookieConsent` component)
- **Audit logging**: All data access operations logged with timestamps and source IPs
- **Data minimization**: Only essential data collected and stored

## i18n Support

- Dual language support: Spanish (ES, default) and English (EN)
- Translation module: `frontend/src/lib/i18n.ts` (~286 lines)
- Language switcher component: `frontend/src/components/layout/LanguageSwitcher.tsx`
- Frontend UI text in Spanish, backend/system messages in English

## Deployment Pipeline

- **CDK Pipelines** (`infrastructure/stacks/pipeline_stack.py`): Automated CI/CD
- **Source**: GitHub via CodeStar Connections
- **Region**: eu-west-1
- **Frontend**: Static export -> S3 bucket -> CloudFront distribution
- **Backend**: Lambda functions bundled via CDK, AppSync API, DynamoDB tables
- **WAF**: Attached to AppSync API endpoint

## Key Patterns

- Cognito pre-signup Lambda auto-confirms users
- Lambda resolvers are individual Python files in `backend/lambdas/resolvers/`
- GraphQL schema lives in `backend/schema/schema.graphql`
- CDK entry point is `infrastructure/app.py`, stacks in `infrastructure/stacks/`
- Frontend uses Next.js App Router with route groups `(auth)` and `(app)`
- Auth: `auth_helpers.py` provides `check_user_access` + `check_admin_access`
- Validation: `validation.py` provides shared input validation
- Voice: OpenAI Realtime API with server-side token generation
- Analysis: Bedrock (Claude -> Nova fallback) for challenge evaluation
- Maps: Mapbox GL JS with react-map-gl, multiple styles, 3D toggle
- Admin: role-based access via Cognito groups
- Theme: dark (default), light, system; persisted to localStorage
- Animations: Framer Motion with reduced-motion support
